/* eslint-disable */

import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  // query current user to check signed in
  const sesh = context.session as Session;

  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this!');
  }

  // query current user's cart
  // see if current item is in their cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: {
      user: { id: sesh.itemId },
      product: { id: productId },
    },
    resolveFields: 'id,quantity',
  });

  const [existingCartItem] = allCartItems;

  // if yes increment by one
  if (existingCartItem) {
    console.log(
      `There are already ${existingCartItem.quantity} - increment by 1`
    );

    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
      resolveFields: false,
    });
  }

  // if not add new item to cart
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
    resolveFields: false,
  });
}
