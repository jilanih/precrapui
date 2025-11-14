# File Upload Feature Guide

## Overview
You can now manually upload data to the dashboard using CSV or JSON files, in addition to the automated n8n workflow integration.

## Two Ways to Add Data

### 1. Automated (n8n Workflow)
- Run your n8n workflow
- Data automatically POSTs to the dashboard API
- Real-time updates

### 2. Manual (File Upload)
- Click "Upload File" button in the dashboard
- Select a CSV or JSON file
- Data is merged with existing records

## File Formats

### CSV Format
Download the template: Click "Download CSV Template" in the dashboard

Required columns:
- `PB C-ASIN` (required for deduplication)
- `1P C-ASIN`
- `positioning` (COMPARABLE, UNDER-SPEC'D, OVER-SPEC'D)
- `pricing_recommendation` (Price Match, Revert to Base Price)
- `FLC Check`
- `PCOGS+IB-VFCC Check`
- Other optional fields

Example:
```csv
PB C-ASIN,1P C-ASIN,positioning,pricing_recommendation
B08SAMPLE1,B0DSAMPLE1,COMPARABLE,Price Match
B08SAMPLE2,B0DSAMPLE2,UNDER-SPEC'D,Revert to Base Price
```

### JSON Format
```json
[
  {
    "PB C-ASIN": "B08SAMPLE1",
    "1P C-ASIN": "B0DSAMPLE1",
    "positioning": "COMPARABLE",
    "pricing_recommendation": "Price Match",
    "FLC Check": "Pass"
  }
]
```

## How It Works

1. **Upload**: Click "Upload File" and select your CSV/JSON
2. **Parse**: File is parsed and validated
3. **Merge**: New data is merged with existing data
4. **Deduplicate**: If PB C-ASIN already exists, it's updated with new data
5. **Save**: Data is persisted to the JSON file
6. **Refresh**: Dashboard automatically refreshes to show new data

## Features

✅ **Append Logic**: New records are added, existing ones are updated
✅ **Deduplication**: Same PB C-ASIN = update existing record
✅ **Timestamps**: Each upload is timestamped
✅ **Source Tracking**: Uploaded records are tagged with `_source: "manual_upload"`
✅ **Validation**: File format and required fields are validated
✅ **Feedback**: Success/error messages show what happened

## Use Cases

- **Bulk Import**: Upload historical data from spreadsheets
- **Manual Corrections**: Fix individual records without re-running workflow
- **Testing**: Add test data without running n8n
- **Data Migration**: Import data from other systems
- **Offline Work**: Prepare data offline and upload when ready

## Tips

- Keep the same column names as the n8n workflow output
- PB C-ASIN is used as the unique identifier
- CSV files are easier to edit in Excel/Google Sheets
- JSON files preserve complex data structures
- Download the template to ensure correct format
- Upload multiple times - data accumulates safely

## Troubleshooting

**"No file provided"**
- Make sure you selected a file before clicking upload

**"Unsupported file type"**
- Only .csv and .json files are accepted

**"CSV file is empty or invalid"**
- Check that your CSV has headers and at least one data row

**"Failed to process file"**
- Check the file format matches the template
- Ensure PB C-ASIN column exists
- Verify JSON is valid (use a JSON validator)
