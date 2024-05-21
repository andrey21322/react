import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:5000'

export const updateItemInDB = createAsyncThunk('items/updateItemInDB', async (item) => {
  const response = await axios.put(`${API_URL}/items/${item.id}`, item)
  return response.data
})

export const updateItemAmountInItems = createAsyncThunk('items/updateItemAmountInItems', async ({ id, amount }) => {
  try {
    const response = await axios.get(`${API_URL}/items/${id}`)
    const itemToUpdate = response.data
    
    itemToUpdate.amount += amount
    if(itemToUpdate.amount <= 0) {
      itemToUpdate.amount = 0
    }
    await axios.put(`${API_URL}/items/${id}`, itemToUpdate)
    return { id, amount }
  } catch (error) {
    throw error
  }
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

export const removeItemFromCart = createAsyncThunk('cart/removeItemFromCart', async (itemToRemove) => {
  try {
    await axios.delete(`${API_URL}/cart/${itemToRemove.id}`)
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
    },
    updateItemAmount(state, action) {
      const { id, amount } = action.payload
      const item = state.find((i) => i.id === id)
      if (item) {
        item.amount += amount
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.push(action.payload)
    })
    builder.addCase(updateCartItemAmount.fulfilled, (state, action) => {
      const { item, amount } = action.payload
      const index = state.findIndex((i) => i.id === item.id)
      if (index !== -1) {
        state[index].amount = amount
      }
    })
    builder.addCase(removeItemFromCart.fulfilled, (state, action) => {
      const removedItemId = action.payload.id
      return state.filter((item) => item.id !== removedItemId)
    })
  }
})

export const { updateCartItemName, updateItemAmount } = cartSlice.actions
export default cartSlice.reducer