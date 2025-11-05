import React, { useState } from 'react';
import { runAllProductTests, testAdminApis, quickTestAdmin, quickTestPublic } from '../../tests/productApiTestRunner';
import toast from 'react-hot-toast';

/**
 * Product Test Panel Component
 * 
 * This component provides a UI to test all product CRUD operations
 * Usage: Import and add to admin dashboard or create a test route
 */
const ProductTestPanel = () => {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [currentTest, setCurrentTest] = useState('');

  const runAllTests = async () => {
    setTesting(true);
    setCurrentTest('Running all tests...');
    setTestResults(null);

    try {
      const results = await runAllProductTests();
      setTestResults(results);
      toast.success(`Tests completed! ${results.passed}/${results.total} passed`);
    } catch (error) {
      console.error('Test suite error:', error);
      toast.error('Test suite failed');
    } finally {
      setTesting(false);
      setCurrentTest('');
    }
  };

  const runAdminTests = async () => {
    setTesting(true);
    setCurrentTest('Running admin tests...');
    setTestResults(null);

    try {
      await testAdminApis();
      toast.success('Admin tests completed!');
    } catch (error) {
      console.error('Admin tests error:', error);
      toast.error('Admin tests failed');
    } finally {
      setTesting(false);
      setCurrentTest('');
    }
  };

  const runQuickTest = async (testType) => {
    setTesting(true);
    setCurrentTest(`Running ${testType} quick test...`);

    try {
      let result;
      if (testType === 'admin') {
        result = await quickTestAdmin();
      } else {
        result = await quickTestPublic();
      }

      if (result.success) {
        toast.success(`${testType} quick test passed!`);
      } else {
        toast.error(`${testType} quick test failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Quick test error:', error);
      toast.error('Quick test failed');
    } finally {
      setTesting(false);
      setCurrentTest('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-[#5c2d16] mb-4">Product CRUD Test Panel</h2>
      <p className="text-gray-600 mb-6">
        Test all product management features including slug auto-generation, validation, and CRUD operations.
      </p>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={runAllTests}
          disabled={testing}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
        >
          {testing && currentTest.includes('all') ? 'Running...' : 'Run All Tests'}
        </button>

        <button
          onClick={runAdminTests}
          disabled={testing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400"
        >
          {testing && currentTest.includes('admin') ? 'Running...' : 'Test Admin APIs'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => runQuickTest('admin')}
            disabled={testing}
            className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400 text-sm"
          >
            Quick Admin Test
          </button>
          <button
            onClick={() => runQuickTest('public')}
            disabled={testing}
            className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:bg-gray-400 text-sm"
          >
            Quick Public Test
          </button>
        </div>
      </div>

      {/* Current Test Status */}
      {currentTest && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-800 font-medium">{currentTest}</p>
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Test Results</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{testResults.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{testResults.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{testResults.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-blue-600">
              {((testResults.passed / testResults.total) * 100).toFixed(2)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>

          {/* Failed Tests */}
          {testResults.tests.filter(t => t.status !== 'PASSED').length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-red-600 mb-2">Failed Tests:</h4>
              <ul className="list-disc list-inside space-y-1">
                {testResults.tests
                  .filter(t => t.status !== 'PASSED')
                  .map((test, idx) => (
                    <li key={idx} className="text-sm text-red-800">
                      {test.name}: {test.error || 'Unknown error'}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* All Test Details */}
          <details className="mt-4">
            <summary className="cursor-pointer text-blue-600 font-medium hover:text-blue-800">
              View All Test Details
            </summary>
            <div className="mt-2 space-y-2">
              {testResults.tests.map((test, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded ${
                    test.status === 'PASSED' ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{test.name}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        test.status === 'PASSED'
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                  {test.error && (
                    <div className="text-sm text-red-700 mt-1">{test.error}</div>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">📋 Testing Instructions:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
          <li>Open browser console (F12) to see detailed test logs</li>
          <li>Ensure you're logged in as admin for admin API tests</li>
          <li>Check that backend server is running</li>
          <li>Verify at least one category exists for product creation tests</li>
          <li>Tests will create, update, and delete test products</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductTestPanel;

