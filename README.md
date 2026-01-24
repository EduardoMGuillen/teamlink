# TeamLink - React Native App

A comprehensive team management app built with React Native and Expo, designed for team collaboration and workforce management.

## Features

### Core Features

- 📊 **Dashboard** - Overview with quick actions, statistics, recent activity, and today's schedule
- ⏰ **Time Clock** - Clock in/out with location tracking and shift history
- 📅 **Calendar & Schedule** - Recurring work schedules and individual calendar events with conflict detection
- ✅ **Tasks** - Task management with priorities, filters, search, and assignment to team members
- 💬 **Chat** - Team and direct messaging
- 📢 **Updates** - Company announcements and updates
- 👥 **Directory** - Employee directory with search and filter
- 🔔 **Notifications** - Real-time notifications with badge counter
- ⚙️ **Settings** - App settings, language selection, and profile management

### Additional Features

- 🌍 **Multi-language Support** - English, Spanish, and French
- 🔐 **Authentication** - Secure login and registration with Supabase
- 📱 **Cross-platform** - iOS, Android, and Web support
- ☁️ **Cloud Sync** - All data synced with Supabase backend

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- Expo Go app on your iOS/Android device (for testing)
- Supabase account (for database and authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TeamLink
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the root directory (optional, defaults are provided)
   - Add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up the database:
   - Go to your Supabase project SQL Editor
   - Run the scripts in the `database/` folder in this order:
     1. `complete_schema.sql` - Main database schema
     2. `fix_user_insert_policy.sql` - User creation trigger
     3. `fix_team_members_rls.sql` - Team members RLS fix
     4. `fix_tasks_insert_policy.sql` - Tasks RLS fix
     5. `fix_shifts_rls.sql` - Shifts RLS fix
     6. `calendar_schedule_schema.sql` - Calendar & Schedule tables

5. Start the development server:
```bash
npm start
```

6. Run on iOS simulator (requires macOS):
```bash
npm run ios
```

7. Run on Android emulator:
```bash
npm run android
```

8. Run on web:
```bash
npm run web
```

9. Scan QR code with Expo Go app on your phone

## Database Setup

### Supabase Configuration

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema scripts in order:
   - `database/complete_schema.sql` - Creates all tables, RLS policies, and triggers
   - `database/fix_user_insert_policy.sql` - Enables automatic user profile creation
   - `database/fix_team_members_rls.sql` - Fixes RLS recursion issues
   - `database/fix_tasks_insert_policy.sql` - Allows task assignment
   - `database/fix_shifts_rls.sql` - Fixes shifts RLS policies
   - `database/calendar_schedule_schema.sql` - Calendar & Schedule features

3. Configure Authentication:
   - Go to Authentication > Settings
   - Disable "Enable email confirmations" for development (optional)
   - See `DISABLE_EMAIL_CONFIRMATION.md` for instructions

4. Set up environment variables:
   - Copy your Supabase URL and anon key from Project Settings > API
   - Add them to your `.env` file or use the defaults in `src/config/supabase.js`

## Development

### Development Builds

For iOS (requires EAS Build):
```bash
npm run build:dev:ios
```

For Android:
```bash
npm run build:dev:android
```

### Web Development

Start web development server:
```bash
npm run web
```

Build for production:
```bash
npm run build:web
```

## Deployment

### Web Deployment (Vercel)

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Configure environment variables in Vercel:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Set build command: `npm run vercel-build`
5. Set output directory: `web-build`
6. Deploy!

The `vercel.json` file is already configured for optimal deployment.

### Mobile App Deployment

#### iOS
```bash
eas build --platform ios --profile production
```

#### Android
```bash
eas build --platform android --profile production
```

## Project Structure

```
TeamLink/
├── src/
│   ├── screens/              # Screen components
│   │   ├── DashboardScreen.js
│   │   ├── TasksScreen.js
│   │   ├── TimeClockScreen.js
│   │   ├── ScheduleScreen.js
│   │   ├── ChatScreen.js
│   │   ├── DirectoryScreen.js
│   │   ├── UpdatesScreen.js
│   │   ├── NotificationsScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignUpScreen.js
│   │   └── ConnectionTestScreen.js
│   ├── services/            # API services
│   │   ├── authService.js
│   │   ├── tasksService.js
│   │   ├── shiftsService.js
│   │   ├── teamsService.js
│   │   ├── messagesService.js
│   │   ├── updatesService.js
│   │   ├── notificationsService.js
│   │   ├── schedulesService.js
│   │   └── calendarScheduleService.js
│   ├── context/             # React Context for state management
│   │   └── AppStateContext.js
│   ├── config/              # Configuration files
│   │   └── supabase.js
│   └── utils/               # Utility functions
│       ├── i18n.js          # Internationalization
│       ├── useTranslation.js # Translation hook
│       └── timezones.js      # Timezone and country data
├── database/                # SQL scripts
│   ├── complete_schema.sql
│   ├── calendar_schedule_schema.sql
│   ├── fix_user_insert_policy.sql
│   ├── fix_team_members_rls.sql
│   ├── fix_tasks_insert_policy.sql
│   └── fix_shifts_rls.sql
├── assets/                  # Images and static assets
├── App.js                   # Main app entry point
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
├── vercel.json              # Vercel deployment configuration
└── package.json             # Dependencies
```

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo SDK 54** - Development platform and tooling
- **React 19.1.0** - UI library
- **React Navigation** - Navigation library
  - Bottom Tab Navigator
  - Stack Navigator (conditional for web/native)
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Row Level Security (RLS)
- **Expo Vector Icons** - Icon library
- **React Native Calendars** - Calendar component
- **React Native Community DateTimePicker** - Date/time pickers
- **React Native Picker** - Platform-specific pickers
- **AsyncStorage** - Local data persistence

## Key Features Implementation

### Calendar & Schedule
- Recurring work schedules with day-of-week selection
- Individual calendar events
- Conflict detection between events and recurring schedules
- Visual calendar with marked dates
- Today's activities summary on dashboard

### Task Management
- Create, edit, delete tasks
- Assign tasks to team members
- Priority levels (low, medium, high)
- Status tracking (pending, in-progress, completed)
- Search and filter functionality
- Due date selection with platform-specific pickers

### Time Clock
- Clock in/out with location selection
- Real-time duration tracking
- Shift history
- Weekly hours summary
- Active shift detection

### Team Collaboration
- Employee directory
- Team and direct messaging
- Company announcements
- Task assignment
- Real-time notifications

## Internationalization (i18n)

The app supports multiple languages:
- English (en)
- Spanish (es)
- French (fr)

Users can change the language in Settings. All UI text is localized.

## Database Schema

The database includes the following main tables:
- `users` - User profiles
- `tasks` - Tasks with assignment support
- `shifts` - Time clock entries
- `teams` - Team management
- `team_members` - Team membership
- `messages` - Team and direct messages
- `updates` - Company announcements
- `notifications` - User notifications
- `recurring_schedules` - Recurring work schedules
- `calendar_events` - Individual calendar events

All tables use Row Level Security (RLS) for data protection.

## Troubleshooting

### Common Issues

1. **"Port 8081 is being used"**
   - Kill the process using the port or restart your terminal

2. **Database connection errors**
   - Verify your Supabase credentials in `src/config/supabase.js`
   - Check that all SQL scripts have been run
   - Use the Connection Test screen to verify connectivity

3. **RLS policy errors**
   - Make sure all fix scripts have been executed
   - Check that user authentication is working

4. **Build errors on Vercel**
   - Verify Node.js version (18+)
   - Check environment variables are set
   - Review build logs for specific errors

## Development on Windows

This app is built with React Native and Expo, which allows you to develop on Windows and deploy to both iOS and Android.

### For iOS Development on Windows:

1. **Use Expo Go** (Recommended for development):
   - Install Expo Go on your iPhone
   - Run `npm start` and scan the QR code
   - No Mac required for development!

2. **Build for iOS** (Requires Mac or cloud service):
   - Use [Expo Application Services (EAS)](https://expo.dev/build) to build iOS apps in the cloud
   - Or use a Mac/cloud Mac service for final builds

### For Android Development on Windows:

- Install Android Studio
- Set up Android emulator
- Run `npm run android`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check the troubleshooting section
- Review the database setup instructions
- Verify all dependencies are installed correctly

---

Built with ❤️ using React Native and Expo
