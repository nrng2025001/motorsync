/**
 * Backend Integration Test Utility
 * 
 * This file provides comprehensive testing utilities to verify
 * the integration with the car-dealership-backend system
 */

import {
  apiClient,
  AuthAPI, 
  BookingsAPI, 
  EnquiriesAPI, 
  QuotationsAPI,
  API_ENDPOINTS 
} from './index';

/**
 * Test result interface
 */
export interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

/**
 * Integration test suite result
 */
export interface IntegrationTestResult {
  overallSuccess: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  results: TestResult[];
  timestamp: string;
}

/**
 * Test configuration
 */
export interface TestConfig {
  baseUrl: string;
  testUser?: {
    email: string;
    password: string;
    role: string;
  };
  timeout: number;
  verbose: boolean;
}

/**
 * Default test configuration
 */
const DEFAULT_CONFIG: TestConfig = {
  baseUrl: 'http://localhost:4000/api',
  timeout: 10000,
  verbose: true,
};

/**
 * Integration Test Suite
 * 
 * Comprehensive test suite for backend integration
 */
export class IntegrationTestSuite {
  private config: TestConfig;
  private results: TestResult[] = [];
  private startTime: number = 0;

  constructor(config: Partial<TestConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<IntegrationTestResult> {
    this.startTime = Date.now();
    this.results = [];

    if (this.config.verbose) {
      console.log('🚀 Starting Backend Integration Tests...');
      console.log(`📍 Backend URL: ${this.config.baseUrl}`);
      console.log('─'.repeat(50));
    }

    // Test categories
    await this.testHealthAndConnection();
    await this.testAuthentication();
    await this.testEnquiries();
    await this.testBookings();
    await this.testQuotations();
    await this.testBulkImport();
    await this.testMobileEndpoints();

    const totalDuration = Date.now() - this.startTime;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.length - passedTests;

    const result: IntegrationTestResult = {
      overallSuccess: failedTests === 0,
      totalTests: this.results.length,
      passedTests,
      failedTests,
      totalDuration,
      results: this.results,
      timestamp: new Date().toISOString(),
    };

    this.printSummary(result);
    return result;
  }

  /**
   * Test health and connection endpoints
   */
  private async testHealthAndConnection(): Promise<void> {
    await this.runTest('Health Check', async () => {
      const response = await apiClient.get('/health');
      return response.data;
    });

    await this.runTest('Version Info', async () => {
      const response = await apiClient.get('/version');
      return response.data;
    });

    await this.runTest('Connection Test', async () => {
      const result = await runConnectionTest();
      return result;
    });
  }

  /**
   * Test authentication endpoints
   */
  private async testAuthentication(): Promise<void> {
    await this.runTest('Get Profile (Unauthenticated)', async () => {
      try {
        await AuthAPI.getProfile();
        throw new Error('Should have failed without authentication');
      } catch (error: any) {
        if (error.response?.status === 401) {
          return { message: 'Correctly rejected unauthenticated request' };
        }
        throw error;
      }
    });

    // Note: Firebase sync would require actual Firebase token
    // This is a placeholder for when Firebase is properly configured
    await this.runTest('Firebase Sync (Placeholder)', async () => {
      return { message: 'Firebase sync test requires proper Firebase configuration' };
    });
  }

  /**
   * Test enquiry endpoints
   */
  private async testEnquiries(): Promise<void> {
    await this.runTest('Get Enquiry Models', async () => {
      const response = await EnquiriesAPI.getModels();
      return response;
    });

    await this.runTest('Get Enquiry Variants', async () => {
      const response = await EnquiriesAPI.getVariants();
      return response;
    });

    await this.runTest('Get Enquiry Colors', async () => {
      const response = await EnquiriesAPI.getColors();
      return response;
    });

    await this.runTest('Get Enquiry Sources', async () => {
      const response = await EnquiriesAPI.getSources();
      return response;
    });

    await this.runTest('Get Enquiries List', async () => {
      const response = await EnquiriesAPI.getEnquiries({ page: 1, limit: 10 });
      return response;
    });
  }

  /**
   * Test booking endpoints
   */
  private async testBookings(): Promise<void> {
    await this.runTest('Get Bookings List', async () => {
      const response = await BookingsAPI.getBookings({ page: 1, limit: 10 });
      return response;
    });

    await this.runTest('Get Booking Stats', async () => {
      const response = await BookingsAPI.getStats();
      return response;
    });

    await this.runTest('Search Bookings', async () => {
      const response = await BookingsAPI.searchBookings('test');
      return response;
    });
  }

  /**
   * Test quotation endpoints
   */
  private async testQuotations(): Promise<void> {
    await this.runTest('Get Quotations List', async () => {
      const response = await QuotationsAPI.getQuotations({ page: 1, limit: 10 });
      return response;
    });

    await this.runTest('Get Quotation Stats', async () => {
      const response = await QuotationsAPI.getStats();
      return response;
    });
  }

  /**
   * Test bulk import endpoints
   */
  private async testBulkImport(): Promise<void> {
    await this.runTest('Get Import History', async () => {
      const response = await BookingsAPI.getImports();
      return response;
    });
  }

  /**
   * Test mobile app endpoints
   */
  private async testMobileEndpoints(): Promise<void> {
    await this.runTest('Get Advisor Bookings (Unauthenticated)', async () => {
      try {
        await BookingsAPI.getMyBookings();
        throw new Error('Should have failed without authentication');
      } catch (error: any) {
        if (error.response?.status === 401) {
          return { message: 'Correctly rejected unauthenticated request' };
        }
        throw error;
      }
    });
  }

  /**
   * Run a single test
   */
  private async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (this.config.verbose) {
        console.log(`🧪 Running: ${testName}`);
      }

      const data = await testFn();
      const duration = Date.now() - startTime;

      this.results.push({
        testName,
        success: true,
        duration,
        data,
      });

      if (this.config.verbose) {
        console.log(`✅ ${testName} (${duration}ms)`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error';

      this.results.push({
        testName,
        success: false,
        duration,
        error: errorMessage,
      });

      if (this.config.verbose) {
        console.log(`❌ ${testName} (${duration}ms) - ${errorMessage}`);
      }
    }
  }

  /**
   * Print test summary
   */
  private printSummary(result: IntegrationTestResult): void {
    console.log('\n' + '─'.repeat(50));
    console.log('📊 INTEGRATION TEST SUMMARY');
    console.log('─'.repeat(50));
    console.log(`✅ Passed: ${result.passedTests}/${result.totalTests}`);
    console.log(`❌ Failed: ${result.failedTests}/${result.totalTests}`);
    console.log(`⏱️  Duration: ${result.totalDuration}ms`);
    console.log(`🎯 Overall: ${result.overallSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (result.failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      result.results
        .filter(r => !r.success)
        .forEach(r => console.log(`   • ${r.testName}: ${r.error}`));
    }
    
    console.log('─'.repeat(50));
  }
}

/**
 * Quick integration test runner
 */
export async function runQuickIntegrationTest(): Promise<IntegrationTestResult> {
  const testSuite = new IntegrationTestSuite({ verbose: true });
  return await testSuite.runAllTests();
}

/**
 * Silent integration test runner (for CI/CD)
 */
export async function runSilentIntegrationTest(): Promise<IntegrationTestResult> {
  const testSuite = new IntegrationTestSuite({ verbose: false });
  return await testSuite.runAllTests();
}

/**
 * Test specific endpoint
 */
export async function testEndpoint(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await apiClient.request({
      method,
      url: endpoint,
      timeout: 5000,
    });
    
    const duration = Date.now() - startTime;
    
    return {
      testName: `${method} ${endpoint}`,
      success: response.status >= 200 && response.status < 300,
      duration,
      data: response.data,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    return {
      testName: `${method} ${endpoint}`,
      success: false,
      duration,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Test all API endpoints
 */
export async function testAllEndpoints(): Promise<TestResult[]> {
  const endpoints = [
    { method: 'GET' as const, path: '/health' },
    { method: 'GET' as const, path: '/version' },
    { method: 'GET' as const, path: '/enquiries/models' },
    { method: 'GET' as const, path: '/enquiries/variants' },
    { method: 'GET' as const, path: '/enquiries/colors' },
    { method: 'GET' as const, path: '/enquiries/sources' },
    { method: 'GET' as const, path: '/bookings' },
    { method: 'GET' as const, path: '/quotations' },
    { method: 'GET' as const, path: '/bookings/imports' },
  ];

  const results: TestResult[] = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.method);
    results.push(result);
  }
  
  return results;
}

/**
 * Generate test report
 */
export function generateTestReport(result: IntegrationTestResult): string {
  const report = `
# Backend Integration Test Report

**Test Date:** ${new Date(result.timestamp).toLocaleString()}
**Backend URL:** ${apiClient.defaults.baseURL}
**Overall Result:** ${result.overallSuccess ? '✅ PASSED' : '❌ FAILED'}

## Summary
- **Total Tests:** ${result.totalTests}
- **Passed:** ${result.passedTests} (${Math.round((result.passedTests / result.totalTests) * 100)}%)
- **Failed:** ${result.failedTests} (${Math.round((result.failedTests / result.totalTests) * 100)}%)
- **Duration:** ${result.totalDuration}ms

## Test Results

${result.results.map(r => `
### ${r.testName}
- **Status:** ${r.success ? '✅ PASSED' : '❌ FAILED'}
- **Duration:** ${r.duration}ms
${r.error ? `- **Error:** ${r.error}` : ''}
${r.data ? `- **Data:** \`${JSON.stringify(r.data, null, 2)}\`` : ''}
`).join('\n')}

## Recommendations

${result.failedTests > 0 ? `
⚠️ **Action Required:** ${result.failedTests} test(s) failed. Please check the backend configuration and ensure all services are running properly.
` : `
✅ **All tests passed!** The backend integration is working correctly.
`}
`;

  return report;
}

export default {
  IntegrationTestSuite,
  runQuickIntegrationTest,
  runSilentIntegrationTest,
  testEndpoint,
  testAllEndpoints,
  generateTestReport,
};
