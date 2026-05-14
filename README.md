# Platform as a Service Microapp

A standalone React application for managing cloud platforms with Material-UI and Redux Toolkit.

## Features

- **Platform List View** - Display all platforms with search, filters, and pagination
- **Platform Details** - View comprehensive platform information with metrics
- **Instance Management** - Manage compute instances for each platform
- **Create Platform** - Create new platforms with configuration form
- **Responsive Design** - Mobile-friendly UI using Material-UI
- **Static Mock Data** - 20 sample platforms for testing

## Tech Stack

- React 18
- Material-UI v5
- Redux Toolkit
- React Router v6
- Webpack 5
- Babel 7

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd Pas-Microapp
```

2. Install dependencies:
```bash
npm install
```

### Running the App

Start the development server:
```bash
npm start
```

The app will open automatically at `http://localhost:3000`

### Building for Production

Create a production build:
```bash
npm run build
```

Output will be in the `dist/` folder.

## Project Structure

```
Pas-Microapp/
├── src/
│   ├── components/        # Reusable UI components
│   │   └── Layout.jsx     # Main layout wrapper
│   ├── views/             # Page components
│   │   ├── PasList/
│   │   │   ├── PlatformList.jsx
│   │   │   └── PasActions/
│   │   │       └── CreatePas.jsx
│   │   └── PasOverview/
│   │       ├── OverviewMain.jsx
│   │       ├── Overview.jsx
│   │       └── Instances/
│   │           └── Instances.jsx
│   ├── store/             # Redux configuration
│   │   ├── index.js
│   │   └── slices/
│   ├── constants/         # Constants and mock data
│   │   └── mockData.js
│   ├── App.jsx            # Main app component
│   └── index.jsx          # Entry point
├── public/
│   ├── index.html         # HTML template
│   └── favicon.ico        # Favicon
├── package.json           # Dependencies
├── webpack.config.js      # Webpack configuration
├── babel.config.json      # Babel configuration
└── .eslintrc             # ESLint configuration
```

## Main Features

### 1. Platform List
- View all platforms in a table format
- Search by name or ID
- Filter by status, region, or type
- Pagination with customizable rows per page
- View summary statistics (total, active, inactive, maintenance)

### 2. Platform Details
- Tabbed interface with Overview, Instances, and Activity sections
- Key metrics display (uptime, users, created date)
- Related instances table
- Activity log

### 3. Instance Management
- Add new instances
- Delete existing instances
- View resource summary (CPU cores, memory)

### 4. Create Platform
- Form with validation
- Region and type selection
- Resource configuration (CPU, memory)
- Configuration summary preview

## Usage

### View Platforms
1. Open the app - you'll see the platform list with statistics
2. Use the search bar to find platforms by name or ID
3. Filter by Status, Region, or Type dropdowns
4. Click on a platform name to view details

### Create a New Platform
1. Click the "Create Platform" button
2. Fill in the platform details in the form
3. Click "Create Platform" to submit
4. The form will reset on successful submission

### Manage Instances
1. Navigate to a platform detail page
2. Click the "Instances" tab
3. View existing instances or add new ones
4. Delete instances as needed

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start dev server on port 3000 |
| `npm run build` | Build for production |
| `npm run dev` | Alternative dev server command |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |

## Mock Data

The app includes 20 mock platform instances with various statuses, regions, and types for demonstration purposes.

### Platform Properties
- `pas_id` - Unique identifier
- `pas_name` - Platform name
- `status` - Active, Inactive, or Maintenance
- `region` - US-East, US-West, EU-West, etc.
- `type` - Web, Database, API, Cache, Storage, etc.
- `created_date` - Creation date
- `users` - Number of active users
- `uptime` - System uptime percentage

## Future Enhancements

- API integration to replace mock data
- Real-time monitoring dashboards
- User authentication
- Advanced analytics
- Export functionality (CSV, PDF)
- Multi-tenancy support

## License

MIT
