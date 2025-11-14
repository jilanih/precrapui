// Test script to verify the workflow API endpoint
// Run with: node test-api.js

const testData = [
  {
    "Step": "CMT & Spec Check",
    "PB C-ASIN": "B08XYZ1234",
    "CMT ASIN": "B09ABC5678",
    "1P C-ASIN": "B07DEF9012",
    "CMT Check": "Valid",
    "Spec Check": "Comparable",
    "Price Action": "Price Match",
    "Message": "Product specs are comparable"
  },
  {
    "Step": "CMT & Spec Check",
    "PB C-ASIN": "B08XYZ5678",
    "CMT ASIN": "B09ABC9012",
    "1P C-ASIN": "B07DEF3456",
    "CMT Check": "Valid",
    "Spec Check": "Under Spec'd",
    "Price Action": "Price Match",
    "Message": "Product is under-specified"
  },
  {
    "Step": "FLC Check",
    "PB C-ASIN": "B08XYZ9012",
    "1P C-ASIN": "B07DEF7890",
    "Status": "Price Match",
    "FLC Comp": "FLC competitive vs 1P",
    "Message": "Fulfillment costs are competitive"
  }
]

async function testAPI() {
  try {
    console.log('Testing POST to /api/workflow-data...')
    
    const response = await fetch('http://localhost:3000/api/workflow-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    console.log('✅ POST Response:', result)

    // Test GET
    console.log('\nTesting GET from /api/workflow-data...')
    const getResponse = await fetch('http://localhost:3000/api/workflow-data')
    const getData = await getResponse.json()
    console.log('✅ GET Response:', getData)
    console.log(`\n✅ Success! Found ${getData.data?.length || 0} records`)
    console.log('\nNow open http://localhost:3000 and check the "Workflow Results" tab!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\nMake sure your dashboard is running:')
    console.log('  cd precrapui')
    console.log('  npm run dev')
  }
}

testAPI()
