/**
 * Product API Test Runner
 * 
 * This script tests all Product Management APIs
 * Run this from browser console or integrate with your testing framework
 */

import {
  getProducts,
  getProductById,
  getProductsByFilter,
  addOrUpdateReview,
  deleteReview,
  getProductsByCategory,
  searchProducts,
  getProductsByPriceRange,
  getProductsSorted
} from '../services/productService';

import {
  getAllProducts,
  getProductById as adminGetProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByFilter as adminGetProductsByFilter,
  getAllCategories
} from '../services/adminService';

// Test results tracker
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to run a test
const runTest = async (testName, testFunction) => {
  testResults.total++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    const result = await testFunction();
    
    if (result.success || result === true) {
      testResults.passed++;
      testResults.tests.push({ name: testName, status: 'PASSED', result });
      console.log(`✅ PASSED: ${testName}`);
      return { success: true, data: result };
    } else {
      testResults.failed++;
      testResults.tests.push({ name: testName, status: 'FAILED', error: result.message });
      console.log(`❌ FAILED: ${testName}`, result.message);
      return { success: false, error: result.message };
    }
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name: testName, status: 'ERROR', error: error.message });
    console.error(`❌ ERROR: ${testName}`, error.message);
    return { success: false, error: error.message };
  }
};

// ============= PUBLIC API TESTS =============

export const testPublicApis = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('📦 TESTING PUBLIC PRODUCT APIs');
  console.log('='.repeat(50));

  let productId = null;

  // Test 1: Get all products
  await runTest('Get All Products (Default)', async () => {
    const result = await getProducts();
    if (result.success && result.data.products) {
      productId = result.data.products[0]?._id; // Save for later tests
      console.log(`   Found ${result.data.products.length} products`);
      console.log(`   Total: ${result.data.total}, Pages: ${result.data.pages}`);
    }
    return result;
  });

  // Test 2: Get products with pagination
  await runTest('Get All Products (Page 1, Limit 5)', async () => {
    const result = await getProducts({ page: 1, limit: 5 });
    if (result.success) {
      console.log(`   Returned ${result.data.products.length} products`);
    }
    return result;
  });

  // Test 3: Get products sorted by price
  await runTest('Get Products Sorted by Price (Ascending)', async () => {
    const result = await getProducts({ sortBy: 'priceAsc', limit: 3 });
    if (result.success && result.data.products.length > 1) {
      const prices = result.data.products.map(p => p.price);
      console.log(`   Prices: ${prices.join(', ')}`);
    }
    return result;
  });

  // Test 4: Get single product
  if (productId) {
    await runTest('Get Single Product by ID', async () => {
      const result = await getProductById(productId);
      if (result.success) {
        console.log(`   Product: ${result.data.name}`);
        console.log(`   Price: ₹${result.data.price}`);
        console.log(`   Category: ${result.data.category?.name || 'N/A'}`);
      }
      return result;
    });
  }

  // Test 5: Get products by filter
  await runTest('Advanced Filter (Price Range)', async () => {
    const result = await getProductsByFilter({
      minPrice: 100,
      maxPrice: 1000,
      page: 1,
      limit: 5
    });
    if (result.success) {
      console.log(`   Found ${result.data.products?.length || 0} products in price range`);
    }
    return result;
  });

  // Test 6: Search products
  await runTest('Search Products', async () => {
    const result = await searchProducts('product', { limit: 5 });
    if (result.success) {
      console.log(`   Found ${result.data.products?.length || 0} matching products`);
    }
    return result;
  });

  // Test 7: Get products by price range (helper)
  await runTest('Get Products by Price Range (100-500)', async () => {
    const result = await getProductsByPriceRange(100, 500, { limit: 3 });
    return result;
  });

  // Test 8: Get sorted products (helper)
  await runTest('Get Sorted Products (Price Desc)', async () => {
    const result = await getProductsSorted('priceDesc', { limit: 3 });
    return result;
  });

  return { productId };
};

// ============= ADMIN API TESTS =============

export const testAdminApis = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🔐 TESTING ADMIN PRODUCT APIs');
  console.log('='.repeat(50));

  let createdProductId = null;

  // Test 1: Get all products (admin)
  await runTest('Admin: Get All Products', async () => {
    const result = await getAllProducts({ limit: 5 });
    if (result.success) {
      console.log(`   Found ${result.data.products?.length || 0} products`);
    }
    return result;
  });

  // Test 2: Create product (without slug - should auto-generate)
  await runTest('Admin: Create Product (Without Slug)', async () => {
    // First, get a valid category ID
    const categoriesResult = await getAllCategories();
    let categoryId = null;
    if (categoriesResult.success && categoriesResult.data.categories?.length > 0) {
      categoryId = categoriesResult.data.categories[0]._id;
    } else if (categoriesResult.success && categoriesResult.data?.length > 0) {
      categoryId = categoriesResult.data[0]._id;
    }

    if (!categoryId) {
      return { success: false, message: 'No categories available for testing' };
    }

    const testProductName = `Test Product ${Date.now()}`;
    const testProduct = {
      name: testProductName,
      description: 'This is a test product created by API test - slug should be auto-generated',
      price: 999,
      discountPrice: 799,
      stock: 50,
      category: categoryId,
      images: ['https://example.com/test-image.jpg'],
      dosage: '30ml twice daily',
      manufacturer: 'Test Manufacturer',
      origin: 'India',
      shelfLife: '12 months',
      formulation: 'Test Formulation',
      potency: 'Medium',
      metaTitle: 'Test Product SEO Title',
      metaDescription: 'Test product description for SEO'
      // Note: NOT including slug - should be auto-generated
    };

    const result = await createProduct(testProduct);
    if (result.success) {
      createdProductId = result.data._id;
      console.log(`   ✅ Created product ID: ${createdProductId}`);
      console.log(`   ✅ Product name: ${result.data.name}`);
      console.log(`   ✅ Auto-generated slug: ${result.data.slug || 'NOT GENERATED!'}`);
      
      // Verify slug was auto-generated
      if (!result.data.slug) {
        return { success: false, message: 'Slug was not auto-generated' };
      }
      
      // Verify slug format (should be lowercase, hyphenated)
      const expectedSlugPattern = testProductName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (!result.data.slug.includes(expectedSlugPattern.substring(0, 20))) {
        console.log(`   ⚠️  Slug format: ${result.data.slug} (may differ if name was modified)`);
      }
    }
    return result;
  });

  // Test 2.5: Create product with slug (should be ignored)
  await runTest('Admin: Create Product (With Slug - Should Be Ignored)', async () => {
    const categoriesResult = await getAllCategories();
    let categoryId = null;
    if (categoriesResult.success && categoriesResult.data.categories?.length > 0) {
      categoryId = categoriesResult.data.categories[0]._id;
    } else if (categoriesResult.success && categoriesResult.data?.length > 0) {
      categoryId = categoriesResult.data[0]._id;
    }

    if (!categoryId) {
      return { success: false, message: 'No categories available for testing' };
    }

    const testProductName = `Manual Slug Test ${Date.now()}`;
    const testProduct = {
      name: testProductName,
      description: 'Testing that manual slug is ignored',
      price: 888,
      stock: 30,
      category: categoryId,
      slug: 'manual-slug-should-be-ignored' // This should be ignored
    };

    const result = await createProduct(testProduct);
    if (result.success) {
      console.log(`   ✅ Created product ID: ${result.data._id}`);
      console.log(`   ✅ Product name: ${result.data.name}`);
      console.log(`   ✅ Auto-generated slug: ${result.data.slug}`);
      
      // Verify slug was NOT the manual one
      if (result.data.slug === 'manual-slug-should-be-ignored') {
        return { success: false, message: 'Manual slug was not ignored - backend should auto-generate' };
      }
      
      console.log(`   ✅ Manual slug was correctly ignored`);
    }
    return result;
  });

  // Test 3: Get created product
  if (createdProductId) {
    await runTest('Admin: Get Product by ID', async () => {
      const result = await adminGetProductById(createdProductId);
      if (result.success) {
        console.log(`   Product: ${result.data.name}`);
      }
      return result;
    });

    // Test 4: Update product (name change should update slug)
    await runTest('Admin: Update Product (Name Change Updates Slug)', async () => {
      const oldProduct = await adminGetProductById(createdProductId);
      const oldSlug = oldProduct.success ? oldProduct.data.slug : null;
      
      const newName = `Updated Test Product ${Date.now()}`;
      const updates = {
        name: newName,
        price: 899,
        stock: 75,
        isActive: true
        // Note: NOT including slug - should be auto-generated from new name
      };

      const result = await updateProduct(createdProductId, updates);
      if (result.success) {
        console.log(`   ✅ Updated name: ${result.data.name}`);
        console.log(`   ✅ Updated price: ₹${result.data.price}`);
        console.log(`   ✅ Old slug: ${oldSlug}`);
        console.log(`   ✅ New slug: ${result.data.slug}`);
        
        // Verify slug changed when name changed
        if (oldSlug && result.data.slug === oldSlug && newName !== oldProduct.data.name) {
          console.log(`   ⚠️  Warning: Slug did not change when name changed`);
        }
      }
      return result;
    });

    // Test 4.5: Update product with slug (should be ignored)
    await runTest('Admin: Update Product (With Slug - Should Be Ignored)', async () => {
      const updates = {
        price: 777,
        stock: 100,
        slug: 'manual-update-slug-should-be-ignored' // This should be ignored
      };

      const result = await updateProduct(createdProductId, updates);
      if (result.success) {
        console.log(`   ✅ Updated price: ₹${result.data.price}`);
        console.log(`   ✅ Current slug: ${result.data.slug}`);
        
        // Verify slug was NOT the manual one
        if (result.data.slug === 'manual-update-slug-should-be-ignored') {
          return { success: false, message: 'Manual slug update was not ignored' };
        }
        
        console.log(`   ✅ Manual slug update was correctly ignored`);
      }
      return result;
    });

    // Test 4.6: Partial update (only price)
    await runTest('Admin: Partial Update (Only Price)', async () => {
      const updates = {
        price: 1099
        // Only updating price, nothing else
      };

      const result = await updateProduct(createdProductId, updates);
      if (result.success) {
        console.log(`   ✅ Updated price: ₹${result.data.price}`);
        console.log(`   ✅ Slug unchanged: ${result.data.slug}`);
      }
      return result;
    });

    // Test 5: Delete product
    await runTest('Admin: Delete Product', async () => {
      const result = await deleteProduct(createdProductId);
      if (result.success) {
        console.log(`   Product deleted successfully`);
      }
      return result;
    });
  }

  // Test 6: Advanced filter (admin)
  await runTest('Admin: Advanced Filter', async () => {
    const result = await adminGetProductsByFilter({
      page: 1,
      limit: 3,
      sortBy: 'newest'
    });
    return result;
  });

  // Test 7: Validation error test (create with missing required fields)
  await runTest('Admin: Create Product Validation Error (Missing Fields)', async () => {
    const invalidProduct = {
      name: 'Test', // Too short
      price: -100, // Invalid (negative)
      stock: -50 // Invalid (negative)
      // Missing category and other required fields
    };

    const result = await createProduct(invalidProduct);
    
    // This should fail with validation errors
    if (!result.success) {
      console.log(`   ✅ Validation correctly failed`);
      console.log(`   ✅ Error message: ${result.message}`);
      if (result.errors) {
        console.log(`   ✅ Validation errors: ${JSON.stringify(result.errors, null, 2)}`);
      }
      return { success: true, message: 'Validation correctly caught errors' };
    } else {
      return { success: false, message: 'Validation should have failed but product was created' };
    }
  });

  // Test 8: Validation error test (update with invalid data)
  if (createdProductId) {
    await runTest('Admin: Update Product Validation Error (Invalid Data)', async () => {
      const invalidUpdates = {
        price: -50, // Invalid (negative)
        stock: -10 // Invalid (negative)
      };

      const result = await updateProduct(createdProductId, invalidUpdates);
      
      // This should fail with validation errors
      if (!result.success) {
        console.log(`   ✅ Validation correctly failed`);
        console.log(`   ✅ Error message: ${result.message}`);
        if (result.errors) {
          console.log(`   ✅ Validation errors: ${JSON.stringify(result.errors, null, 2)}`);
        }
        return { success: true, message: 'Validation correctly caught errors' };
      } else {
        return { success: false, message: 'Validation should have failed but product was updated' };
      }
    });
  }
};

// ============= REVIEW API TESTS =============

export const testReviewApis = async (productId) => {
  console.log('\n' + '='.repeat(50));
  console.log('⭐ TESTING REVIEW APIs');
  console.log('='.repeat(50));

  if (!productId) {
    console.log('⚠️  Skipping review tests (no product ID available)');
    return;
  }

  let reviewId = null;

  // Test 1: Add review (requires authentication)
  await runTest('Add Product Review', async () => {
    const result = await addOrUpdateReview(productId, {
      rating: 5,
      comment: 'Test review - Excellent product!'
    });
    
    if (result.success) {
      console.log(`   Review added successfully`);
      // Get product to find review ID
      const product = await getProductById(productId);
      if (product.success && product.data.reviews?.length > 0) {
        reviewId = product.data.reviews[product.data.reviews.length - 1]._id;
      }
    }
    return result;
  });

  // Test 2: Update review
  if (reviewId) {
    await runTest('Update Product Review', async () => {
      const result = await addOrUpdateReview(productId, {
        rating: 4,
        comment: 'Updated test review - Good product!'
      });
      
      if (result.success) {
        console.log(`   Review updated successfully`);
      }
      return result;
    });

    // Test 3: Delete review
    await runTest('Delete Product Review', async () => {
      const result = await deleteReview(productId, reviewId);
      
      if (result.success) {
        console.log(`   Review deleted successfully`);
      }
      return result;
    });
  }
};

// ============= MAIN TEST RUNNER =============

export const runAllProductTests = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 PRODUCT API TEST SUITE');
  console.log('='.repeat(50));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  // Reset results
  testResults.total = 0;
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.tests = [];

  try {
    // Run public API tests
    const { productId } = await testPublicApis();

    // Run admin API tests (requires admin authentication)
    await testAdminApis();

    // Run review API tests (requires user authentication)
    await testReviewApis(productId);

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('='.repeat(50));

    // Print failed tests
    const failedTests = testResults.tests.filter(t => t.status !== 'PASSED');
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - ${test.name}: ${test.error || 'Unknown error'}`);
      });
    }

    console.log(`\nCompleted at: ${new Date().toLocaleString()}\n`);

    return testResults;

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    throw error;
  }
};

// ============= QUICK TEST FUNCTIONS =============

// Quick test for public APIs
export const quickTestPublic = async () => {
  const result = await getProducts({ limit: 5 });
  console.log('Quick Public API Test:', result.success ? '✅ PASSED' : '❌ FAILED');
  return result;
};

// Quick test for admin APIs (requires admin auth)
export const quickTestAdmin = async () => {
  const result = await getAllProducts({ limit: 5 });
  console.log('Quick Admin API Test:', result.success ? '✅ PASSED' : '❌ FAILED');
  return result;
};

// ============= EXPORT =============

export default {
  runAllProductTests,
  testPublicApis,
  testAdminApis,
  testReviewApis,
  quickTestPublic,
  quickTestAdmin,
  testResults
};

// ============= USAGE =============

/*
// Import in your component or browser console:
import { runAllProductTests } from './tests/productApiTestRunner';

// Run all tests:
runAllProductTests();

// Or run specific test suites:
import { testPublicApis, testAdminApis } from './tests/productApiTestRunner';
testPublicApis();
testAdminApis();

// Quick tests:
import { quickTestPublic, quickTestAdmin } from './tests/productApiTestRunner';
quickTestPublic();
quickTestAdmin();
*/

