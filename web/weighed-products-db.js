/*
  This file interacts with the app's database and is used by the app's REST APIs.
*/

import sqlite3 from "sqlite3";
import path from "path";
import shopify from "./shopify.js";

const DEFAULT_DB_FILE = path.join(process.cwd(), "weighed-products.sqlite");
const DEFAULT_PURCHASE_QUANTITY = 1;

export const WeighedProductsDB = {
  weighedProductsTableName: "weighed-products",
  db: null,
  ready: null,

  create: async function ({
    weight,
    name,
    productId,
    pricePerUnit,
    total,
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.qrCodesTableName}
      (weight,name,productId,pricePerUnit,total)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      weight,
      name,
      productId,
      pricePerUnit,
      total,
    ]);

    return rawResults[0].id;
  },

  update: async function (
    id,
    {
    weight,
    name,
    productId,
    pricePerUnit,
    total,
    }
  ) {
    await this.ready;

    const query = `
      UPDATE ${this.qrCodesTableName}
      SET
        weight=?,
        name =?,
        productId=?,
        pricePerUnit=?,
        total=?,
      WHERE
        id = ?;
    `;

    await this.__query(query, [
      weight,
      name,
      productId,
      pricePerUnit,
      total,
      id,
    ]);
    return true;
  },

  list: async function (name) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.weighedProductsTableName}
      WHERE name = ?;
    `;

    const results = await this.__query(query, [name]);

    return results.map((weighedprod) => this.__addImageUrl(weighedprod));
  },

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.weighedProductsTableName}
      WHERE id = ?;
    `;
    const rows = await this.__query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return this.__addImageUrl(rows[0]);
  },

  delete: async function (id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.weighedProductsTableName}
      WHERE id = ?;
    `;
    await this.__query(query, [id]);
    return true;
  },

  // /* The destination URL for a QR code is generated at query time */
  // generateQrcodeDestinationUrl: function (qrcode) {
  //   return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/scan`;
  // },

  /* The behavior when a QR code is scanned */
  handleProdAdd: async function (weighedprod) {

    /* Log the prod in the database */
    await this.__increaseProdCount(weighedprod);

    const url = new URL(weighedprod.name);
    switch (qrcode.destination) {

      /* The QR code redirects to the product view */
      case "product":
        return this.__goToProductView(url, weighedprod);

      /* The QR code redirects to checkout */
      case "checkout":
        return this.__goToProductCheckout(url, weighedprod);

      default:
        throw `Unrecognized destination "${weighedprod.name}"`;
    }
  },

  /* Private */

  /*
    Used to check whether to create the database.
    Also used to make sure the database and table are set up before the server starts.
  */

  __hasProductsTable: async function () {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [this.qrCodesTableName]);
    return rows.length === 1;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function () {

    /* Initializes the connection to the database */
    this.db = this.db ?? new sqlite3.Database(DEFAULT_DB_FILE);

    const hasProductsTable = await this.__hasProductsTable();

    if (hasProductsTable) {
      this.ready = Promise.resolve();

      /* Create the QR code table if it hasn't been created */
    } else {
      const query = `
        CREATE TABLE ${this.weighedProductsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name VARCHAR(511) NOT NULL,
          weight VARCHAR(511) NOT NULL,
          productId VARCHAR(255) NOT NULL,
          price VARCHAR(255) NOT NULL,
          products INTEGER,
          createdAt DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime'))
        )
      `;

      /* Tell the various CRUD methods that they can execute */
      this.ready = this.__query(query);
    }
  },

  /* Perform a query on the database. Used by the various CRUD methods. */
  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  // __addImageUrl: function (weighedprod) {
  //   try {
  //     weighedprod.imageUrl = this.__generateQrcodeImageUrl(weighedprod);
  //   } catch (err) {
  //     console.error(err);
  //   }

  //   return qrcode;
  // },

  // __generateQrcodeImageUrl: function (qrcode) {
  //   return `${shopify.api.config.hostScheme}://${shopify.api.config.hostName}/qrcodes/${qrcode.id}/image`;
  // },

  __increaseProdCount: async function (weighedprod) {
    const query = `
      UPDATE ${this.weighedProductsTableName}
      SET products = products + 1
      WHERE id = ?
    `;
    await this.__query(query, [weighedprod.id]);
  },

  __goToProductView: function (url, weighedprod) {
    return productViewURL({
      // discountCode: weighedprod.discountCode,
      host: url.toString(),
      // productHandle: qrcode.handle,
    });
  },

  __goToProductCheckout: function (url, weighedprod) {
    return productCheckoutURL({
      // discountCode: weighedprod.discountCode,
      host: url.toString(),
      variantId: qrcode.variantId,
      quantity: DEFAULT_PURCHASE_QUANTITY,
    });
  },
};

/* Generate the URL to a product page */
function productViewURL({ host, productHandle, discountCode }) {
  const url = new URL(host);
  const productPath = `/products/${productHandle}`;

  /* If this QR Code has a discount code, then add it to the URL */
  if (discountCode) {
    url.pathname = `/discount/${discountCode}`;
    url.searchParams.append("redirect", productPath);
  } else {
    url.pathname = productPath;
  }

  return url.toString();
}

/* Generate the URL to checkout with the product in the cart */
function productCheckoutURL({ host, variantId, quantity = 1, discountCode }) {
  const url = new URL(host);
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  /* The cart URL resolves to a checkout URL */
  url.pathname = `/cart/${id}:${quantity}`;

  if (discountCode) {
    url.searchParams.append("discount", discountCode);
  }

  return url.toString();
}
