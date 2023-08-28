import axios from 'axios';
import { Checkout, OrderProduct } from 'core/entities';
const getProducts = async (orderProducts: OrderProduct[]) => {
  const products = [];
  for (const orderProduct of orderProducts) {
    const product = await axios.get(`${process.env.CATALOG_DB}/products/${orderProduct.productId}`);
    products.push({
      name: product.data.name,
      description: `${product.data.desc.slice(0, 70)}...`,
      quantity: orderProduct.qty,
      price: orderProduct.productPrice,
    });
  }

  return products;
};
const createInvoice = async (checkout: Checkout, userName: any) => {
  const invoiceDetail = {
    shipping: {
      name: userName,
      address: checkout.address.address,
      door: checkout.address.door,
      floor: checkout.address.floor,
      receverName: checkout.address.receiverName,
      postal_code: checkout.address.zipCode,
    },
    items: await getProducts(checkout.basket.orderProducts),
    total: checkout.totalAmount,
    order_number: checkout.id,
    billingDate: checkout.createdAt,
  };
  return invoiceDetail;
};

export { createInvoice };
