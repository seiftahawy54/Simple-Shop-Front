<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary navbar-dark" data-bs-theme="dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Simple Shop</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#" @click="fetchAllProducts()">Products</a>
          </li>
          <li class="nav-item" v-if="currentCategory.length > 0">
            <a class="nav-link" href="#">{{ currentCategory }}</a>
          </li>
          <li class="nav-item" v-if="currentCategory.length > 0" @click="clearCategory()">
            <a class="nav-link" href="#">Clear</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <ul class="list-group bg-black">
    <li class="list-group-item" aria-disabled="true" v-for="category in categories">
      <span class="d-flex justify-content-between me-1">
        <a href="#">{{ category.name }}</a>
        <button class="btn" @click="deleteResource('categories', category.id)">
          <i class="bi bi-trash text-danger"></i>
        </button>
      </span>
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center"
            v-for="subcategory in category.parentCategory.children">
          <span class="badge bg-secondary me-1" @click="selectedCategory(subcategory)">{{ subcategory.name }}</span>
          <button class="btn" @click="deleteResource('categories', subcategory.id)">
            <i class="bi bi-trash text-danger"></i>
          </button>
        </li>
      </ul>
    </li>
  </ul>

  <div class="container-fluid g-5 my-2">
    <div v-if="fetchedProducts.length > 0" class="row g-1">
      <div class="card col-3" v-for="product in fetchedProducts">
        <div>
          <img :src="product.picture" class="card-img-top" :alt="product.name"/>
          <button class="btn" @click="deleteResource('products', product.id)">
            <i class="bi bi-trash text-danger"></i>
          </button>
        </div>
        <div class="card-body">
          <h4 class="card-title">
            {{ product.name }}
          </h4>
          <p class="card-text">{{ product.description }}</p>
        </div>
      </div>
    </div>
  </div>

  <!--
    Add product or category
  -->
  <div class="btn-group">
    <button type="button" class="btn btn-primary" @click="selectForm('product')">Add Product</button>
    <button type="button" class="btn btn-primary" @click="selectForm('category')">Add Category</button>
    <button type="button" class="btn btn-danger" @click="selectForm('')">Clear</button>
  </div>

  <!-- Add new product -->
  <div class="container-fluid g-5 my-2" v-if="selectedForm === 'product'">
    <div class="mb-3">
      <label for="productName" class="form-label">Product Name</label>
      <input type="text" class="form-control" id="productName" placeholder="Product Name" v-model="productNameInput">
    </div>
    <div class="mb-3">
      <label for="description" class="form-label">Description</label>
      <textarea class="form-control" id="description" rows="3" v-model="descriptionInput"></textarea>
    </div>
    <div class="mb-3">
      <input type="file" @change="handleImageUpload" accept="image/*"/>
      <img :src="imageDataURL" alt="Uploaded Image Preview" v-if="imageDataURL"/>
    </div>
    <div class="mb-3">
      <select class="form-select" v-model="categoryInput">
        <option selected value="" disabled>Select Category</option>
        <option v-for="category in categories.map(c => c.parentCategory.children).flat()" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary" @click="submitProductForm">Submit</button>
  </div>

  <!-- Add new category -->
  <div class="container-fluid g-5 my-2" v-if="selectedForm === 'category'">
    <div class="mb-3">
      <label for="categoryName" class="form-label">Category Name</label>
      <input type="text" class="form-control" id="productName" placeholder="Category Name" v-model="categoryName">
    </div>
    <div class="mb-3">
      <label for="description" class="form-label">Category Description</label>
      <textarea class="form-control" id="description" rows="3" v-model="categoryDescription"></textarea>
    </div>
    <div class="mb-3">
      <input type="file" @change="handleImageUpload" accept="image/*"/>
      <img :src="imageDataURL" alt="Uploaded Image Preview" v-if="imageDataURL"/>
    </div>
    <div class="form-check">
      <input class="form-check-input" type="checkbox" id="isParent" v-model="isParentCategory">
      <label class="form-check-label" for="isParent">
        Is Parent?
      </label>
    </div>
    <div class="mb-3" v-if="isParentCategory">
     <div class="form-check" v-for="category in categories.map(c => c.parentCategory.children).flat()" >
       <input :key="category.id"
              :value="category.id"
              :id="category.id"
              v-model="children"
              type="checkbox"
              class="btn-check"
              :name="category.id"
              autocomplete="off">
       <label :key="category.id"
              :for="category.id"
              :id="category.id"
              class="btn btn-outline-primary">
         {{ category.name }}
       </label>
     </div>
    </div>
    <div class="mb-3" v-else>
      <select class="form-select" v-model="categoryInput">
        <option selected value="" disabled>Select Parent</option>
        <option v-for="category in categories" :value="category.parentCategory.id">
          {{ category.name }}
        </option>
      </select>
    </div>

    <button type="submit" class="btn btn-primary" @click="submitCategoryForm">Submit</button>
  </div>

</template>

<script>

import axios from "axios";
import {toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  data() {
    return {
      products: [],
      categories: [],
      selectedTab: 'products',
      currentCategory: '',
      fetchedProducts: [],
      imageDataURL: null,
      pageCanvas: null,
      productNameInput: '',
      descriptionInput: '',
      categoryInput: '',
      selectedForm: '',
      categoryName: '',
      categoryDescription: '',
      isParentCategory: false,
      selectedSubCategory: '',
      children: []
    }
  },
  methods: {
    fetchHomePage() {
      axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/products`).then(response => {
        this.products = response.data.products
      })
          .catch((error) => {
            console.log(error)
          })

      axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/categories`).then(response => {
        this.categories = response.data.categories
      })
          .catch((error) => {
            console.log(error)
          })
    },
    changeTab(tab) {
      this.selectedTab = tab
    },
    selectedCategory(category) {
      this.fetchProductsByCategory(category.id)
    },
    fetchProductsByCategory(selectedCategoryId) {
      this.selectedSubCategory = selectedCategoryId
      axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/products/category/${selectedCategoryId}`).then(response => {
        this.fetchedProducts = response.data
      })
          .catch((error) => {
            this.fetchedProducts = [];
            if (error.response.status === 404) {
              toast.error('Category not found')
            }
            console.log(error)
          })
    },
    clearCategory() {
      this.currentCategory = ''
    },
    handleImageUpload(event) {
      const file = event.target.files[0];

      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        this.imageDataURL = event.target.result;
        this.resizeImage(event.target.result, 3200, 3200);
      };
      reader.readAsDataURL(file);
    },
    resizeImage(imageDataURL, maxWidth, maxHeight) {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        this.pageCanvas = canvas

        // Calculate new dimensions with aspect ratio
        let width = image.width;
        let height = image.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        // Get resized image as data URL (for preview or upload)
        this.imageDataURL = canvas.toDataURL();
      };
      image.src = imageDataURL;
    },
    async submitProductForm() {
      const resizedImageData = this.pageCanvas.toDataURL('image/jpeg'); // Or your preferred image format

      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/products`, {
          picture: resizedImageData,
          name: this.productNameInput,
          description: this.descriptionInput,
          categoryId: this.categoryInput
        });

        if (response.status === 200 || response.status === 201) {
          this.fetchHomePage();
          this.productNameInput = '';
          this.descriptionInput = '';
          this.categoryInput = '';
          this.imageDataURL = null;
          this.pageCanvas = null;

          toast.success('Product added successfully');
        }
      } catch (error) {
        console.error('Form data upload error:', error);
        toast.error('Failed to add product');
      }
    },
    async submitCategoryForm() {
      try {
        console.log({
          name: this.categoryName,
          description: this.categoryDescription,
          isParent: this.isParentCategory,
          parentCategoryId: this.categoryInput,
          picture: this.imageDataURL,
        })
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/categories`, {
          name: this.categoryName,
          description: this.categoryDescription,
          isParent: this.isParentCategory,
          parentCategoryId: this.categoryInput,
          picture: this.imageDataURL,
        });

        if (response.status === 200 || response.status === 201) {
          this.categoryName = '';
          this.categoryDescription = '';
          this.isParentCategory = false;
          this.imageDataURL = null;
          this.selectedForm = '';

          this.fetchHomePage();
          toast.success('Category added successfully');
        }
      } catch (error) {
        console.error('Form data upload error:', error);
        toast.error('Failed to add category');
      }
    },
    selectForm(form) {
      this.selectedForm = form
    },
    deleteResource(resource, id) {
      const confirmDelete = window.confirm('Are you sure you want to delete this resource?')

      if (confirmDelete) {
        axios
            .delete(`${import.meta.env.VITE_BACKEND_URL}/${resource}/${id}`).then(response => {
          this.fetchProductsByCategory(this.selectedSubCategory)
          this.fetchHomePage()
          toast.success('Resource deleted successfully')
        })
            .catch((error) => {
              console.log(error)
              toast.error('Failed to delete resource')
            })
      }
    },
    async fetchAllProducts() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/products`);

        if (response.status === 200) {
          this.fetchedProducts = response.data
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    }
  },
  mounted() {
    this.fetchHomePage()
    this.fetchAllProducts()
  }
}

</script>
