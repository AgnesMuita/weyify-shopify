import React from 'react'
import { useNavigate, TitleBar, Loading } from "@shopify/app-bridge-react";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from "@shopify/polaris";
import WeighedProductForm from '../components/WeighedProductForm';

export default function Homepage() {

  const navigate = useNavigate();
  const isLoading= false;
  const isRefetching = false;
  return (
    <div>
      <WeighedProductForm/>
    </div>
  )
}
