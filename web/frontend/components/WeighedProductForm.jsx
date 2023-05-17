import React,{useState, useEffect, useCallback} from 'react';
import {
  Banner,
  Box,
  Form,
  FormLayout,
  TextField,
  Button,
  ChoiceList,
  Select,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
  EmptyState,
} from "@shopify/polaris";
import {CirclePlusMinor} from '@shopify/polaris-icons';
import {
  ContextualSaveBar,
  ResourcePicker,
  useNavigate,
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";
/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString } from "@shopify/react-form";


export default function WeighedProductForm() {
  const [weighedproduct, setWeighedProduct] = useState('Potatoes')
  const [productImage, setProductImage] = useState("https://cdn-prod.medicalnewstoday.com/content/images/articles/280/280579/potatoes-can-be-healthful.jpg")
  const [weight, setWeight] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState(4)
  const [totalPrice, setTotalPrice] = useState('')
  const [productCart, setProductCart] = useState([
    {name:"", image:"", weight:"", total:""}
    // {name:"", image:"", weight:"", total:""}
  ])
  
  useEffect(()=>{


  })
  const handleSubmit=(e, index)=>{
    const {name, value} = e.target;
    const list = [...productCart]
    list[index][name] = value
    setProductCart(list)
    setWeight(e.target.value)
    setTotalPrice(parseInt(weight)*pricePerUnit)
  }
  console.log(typeof parseInt(weight))
  console.log(typeof pricePerUnit)
  console.log(typeof parseInt(totalPrice))

  const handleAddItem=()=>{
    setProductCart([...productCart,{name:"", image:"",price:"", weight:"", total:""}])
  }
  const handleRemoveItem=(index)=>{
    const list = [...productCart]
    list.splice(index,1);
    setProductCart(list)
  }
  
  return (
    <div>
      {productCart.map((prod, index)=>(
      <Box key={index} background="bg-app-selected" width="15rem">
        <Form onSubmit={handleSubmit}>
            <FormLayout>
              <h1 name="name">{weighedproduct}</h1>
              <img src={productImage} width="150rem" name="image"/>
              <input type="number" placeholder='Weight in grams' name="weight" value={parseInt(weight)} onChange={(e)=>handleSubmit(e,index)}/>
              <h1 name="price" value={prod.price}>Price Per Unit:<span>${pricePerUnit}</span></h1>
              <h1 name="total" value={prod.total}>Total:<span>${totalPrice}</span></h1>
            </FormLayout>
          {productCart.length-1===index && productCart.length<4 && <Button className='' primary={true} onClick={handleAddItem}>Add New Item</Button>}
          {productCart.length>1 && <Button className='remove-btn' onClick={()=>handleRemoveItem(index)}>Remove</Button>}
        </Form>
      </Box>
      ))}
      <div>
        {productCart.map((prod,index)=>(
          <ul key={index}>
            {prod.name && <li>{prod.name}</li>}
          </ul>
        ))}
      </div>
    </div>
  )
}
