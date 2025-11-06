# Admin Panel Documentation

## Overview

The Help Center now includes an admin panel for managing JSON content files through a user-friendly web interface.

## Features

- **Password-protected access** - Simple authentication to protect admin routes
- **File management** - View and edit all JSON content files
- **Form-based editing** - User-friendly forms for structured data (Products, etc.)
- **JSON editing** - Direct JSON editing with real-time validation
- **Visual preview** - Preview how changes will look in the help center
- **Auto-backup** - Automatic backup before saving changes
- **Validation** - JSON syntax validation before saving

## Getting Started

### 1. Set Up Environment Variables

Create a `.env` file in the project root (already created):

```env
ADMIN_PASSWORD=your_secure_password_here
PORT=3001
NODE_ENV=development
```

**Important:** Change the default password before deploying to production!

### 2. Start the Application

For development, you need to run both the backend API server and the frontend dev server:

```bash
# Terminal 1: Start the Express API server
npm run dev:server

# Terminal 2: Start the Vite dev server
npm run dev

# Or run both at once:
npm run dev:all
```

The application will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:3001/api

### 3. Access the Admin Panel

Navigate to: http://localhost:5173/admin/login

Login with the password you set in `.env` (default: `admin123`)

## Admin Interface

### Dashboard

After login, you'll see the admin dashboard with a list of all editable JSON files:

- `regions` - Country/region configurations
- `uk-ireland-products` - Products, hot topics, quick access cards
- `uk-ireland-articles` - Help articles organized by product/topic
- `uk-ireland-topics` - Support hub topics
- `uk-ireland-incidents` - Incident banners and notifications
- `uk-ireland-contact` - Contact methods and support channels
- `uk-ireland-release-notes` - Product release notes

### Editor Page

Click any file to open the editor, which includes:

**1. Form View (default)**
- User-friendly forms with inputs, dropdowns, and add/remove buttons
- Specialized editors for different file types
- Currently implemented: Products (full form), others use JSON editor

**2. JSON View**
- Direct JSON editing with syntax highlighting
- Real-time validation
- Shows syntax errors immediately

**3. Preview Panel**
- Toggle with "Show/Hide Preview" button
- Visual preview of how content will appear
- Structured view of the data

**4. Save Changes**
- Click "Save Changes" to write to the JSON file
- Automatic backup created before saving (`.backup` extension)
- Success/error notifications

## File Structure

```
help-centre-v2/
├── server/                    # Express backend
│   ├── index.js              # Main server file
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   └── files.js          # File read/write endpoints
├── src/
│   ├── context/
│   │   └── AdminAuthContext.tsx  # Admin authentication state
│   ├── pages/admin/
│   │   ├── LoginPage.tsx         # Admin login
│   │   ├── DashboardPage.tsx     # File selector
│   │   └── EditorPage.tsx        # File editor
│   ├── components/admin/
│   │   ├── ProtectedRoute.tsx    # Route guard
│   │   ├── EditorForm.tsx        # Main editor component
│   │   ├── PreviewPanel.tsx      # Preview component
│   │   └── editors/              # Specialized editors
│   │       ├── JSONEditor.tsx        # Raw JSON editor
│   │       ├── ProductsEditor.tsx    # Products form editor
│   │       └── ...                   # Other editors
└── .env                       # Environment variables (not in git)
```

## API Endpoints

### Authentication

**POST** `/api/auth/login`
```json
{
  "password": "your_password"
}
```

Returns:
```json
{
  "success": true,
  "token": "base64_token",
  "message": "Login successful"
}
```

### File Management

**GET** `/api/files/list`
- Lists all available files
- Requires: `Authorization: Bearer <token>`

**GET** `/api/files/:fileId`
- Get specific file content
- Requires: `Authorization: Bearer <token>`

**PUT** `/api/files/:fileId`
- Update file content
- Requires: `Authorization: Bearer <token>`
- Body: `{ "data": {...} }`

## Production Deployment

### Build the Application

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Start Production Server

```bash
NODE_ENV=production npm start
```

The Express server will:
1. Serve the built React app from `dist/`
2. Handle API requests at `/api/*`
3. Serve all requests on one port (default: 3001)

### Environment Variables for Production

Set these environment variables on your server:

```env
ADMIN_PASSWORD=your_very_secure_password
PORT=3000
NODE_ENV=production
```

## Security Considerations

### Current Implementation (MVP)

The current authentication is **simple password-based** for MVP purposes:
- Password stored in environment variable
- Session stored in browser sessionStorage
- Basic token validation

### For Production

Consider implementing:
1. **Stronger authentication** (JWT with expiry, refresh tokens)
2. **HTTPS only** (enforce SSL/TLS)
3. **Rate limiting** (prevent brute force attacks)
4. **User roles** (different permission levels)
5. **Audit logging** (track who changed what and when)
6. **File versioning** (Git integration or version history)

## Backup and Recovery

### Automatic Backups

Every time you save a file, the previous version is saved with a `.backup` extension:
- Original: `products.json`
- Backup: `products.json.backup`

### Manual Backup

Before making significant changes, consider:
1. Committing current files to git
2. Creating a manual backup of `public/data/`

### Recovery

If you need to restore a backup:
1. Find the `.backup` file
2. Copy its contents to the original file
3. Or use git to revert changes: `git checkout -- public/data/`

## Extending the Admin Panel

### Adding a New File Editor

1. Create a new editor component in `src/components/admin/editors/`
2. Import it in `EditorForm.tsx`
3. Add a case in the switch statement with the file ID
4. Update the file mappings in `server/routes/files.js`

Example:
```typescript
// src/components/admin/editors/MyNewEditor.tsx
export default function MyNewEditor({ data, onChange }) {
  // Custom form UI here
}

// src/components/admin/EditorForm.tsx
import MyNewEditor from './editors/MyNewEditor';

case 'my-new-file':
  return <MyNewEditor data={data} onChange={onChange} />;
```

### Adding Preview Support

Update `PreviewPanel.tsx` to add a case for your file type:

```typescript
case 'my-new-file':
  return <div>Custom preview UI</div>;
```

## Troubleshooting

### Cannot login
- Check `.env` file exists and has `ADMIN_PASSWORD` set
- Restart the Express server after changing `.env`
- Clear browser sessionStorage and try again

### API requests failing
- Ensure Express server is running on port 3001
- Check browser console for CORS errors
- Verify the Vite proxy is configured correctly

### Changes not saving
- Check file permissions in `public/data/`
- Look at server console for error messages
- Verify JSON is valid before saving

### Preview not showing
- Some file types may not have preview implemented yet
- Use JSON view to verify structure
- Check browser console for errors

## Support

For issues or questions:
1. Check this documentation
2. Review server logs for errors
3. Check browser console for frontend errors
4. Contact the development team

## Future Enhancements

Potential improvements for future releases:
- [ ] Full form-based editors for all file types
- [ ] Drag-and-drop reordering
- [ ] Bulk operations (import/export)
- [ ] Live preview in iframe
- [ ] Multi-user support with roles
- [ ] Version history with diff view
- [ ] Search and filter in editor
- [ ] Media upload for icons/images
- [ ] Undo/redo functionality
