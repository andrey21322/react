import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:5000'

export const updateItemInDB = createAsyncThunk('items/updateItemInDB', async (item) => {
  await axios.put(`${API_URL}/items/${item.id}`, item)
  return item
})

export const addItemToCart = createAsyncThunk('cart/addItemToCart', async (item) => {
  try {
    const response = await axios.post(`${API_URL}/cart`, item)
    return response.data
  } catch (error) {
    throw error
  }
})

export const updateCartItemAmount = createAsyncThunk('cart/updateCartItemAmount', async ({ itemToUpdate, amount }) => {
  try {
    const response = await axios.put(`${API_URL}/cart/${itemToUpdate.id}`, { ...itemToUpdate, amount })
    return { item: response.data, amount }
  } catch (error) {
    throw error
  }
})

export const removeItemFromCart = createAsyncThunk('cart/removeItemFromCart', async (itemToRemove, { dispatch, getState }) => {
  try {
    await axios.put(`${API_URL}/cart/${itemToRemove.id}`, { amount: 0 })
    return itemToRemove
  } catch (error) {
    throw error
  }
})


const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    updateCartItemName(state, action) {
      const { id, name } = action.payload
      const item = state.find((i) => i.id === id)
      if (item) {
        item.name = name
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.push(action.payload)
    })
    builder.addCase(updateCartItemAmount.fulfilled, (state, action) => {
      const { item, amount } = action.payload
      const index = state.findIndex(item => item.id === item.id)
      if (index !== -1) {
        state[index].amount = amount
      }
    })
    builder.addCase(removeItemFromCart.fulfilled, (state, action) => {
      const removedItemId = action.payload.id
      return state.filter(item => item.id !== removedItemId)
    })
  }
})

export const { updateCartItemName } = cartSlice.actions
export default cartSlice.reducer
