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
  

  const handleSubmit=event=>{
    setWeight(event.target.value)
    setTotalPrice(weight*pricePerUnit)
  }
  console.log(typeof pricePerUnit)
  console.log(typeof parseInt(weight))
  
  console.log(totalPrice)
  return (
    <Box background="bg-app-selected" width="15rem">
      <Form onSubmit={handleSubmit}>
        <FormLayout>
            <h1>{weighedproduct}</h1>
            <img src={productImage} width="150rem"/>
            <input type="number" placeholder='Weight in grams' value={parseInt(weight)} onChange={handleSubmit}/>
            {/* <h1>Price Per Unit:<span>${pricePerUnit}</span></h1> */}
            <h1>Total:<span>${totalPrice}</span></h1>
            {/* <Button submit>Submit</Button> */}
        </FormLayout>
      </Form>
    </Box>
  )
}
