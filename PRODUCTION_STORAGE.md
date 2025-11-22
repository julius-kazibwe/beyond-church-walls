# Production Storage Configuration

## MongoDB Priority in Production

The application is configured to **prioritize MongoDB Atlas** in production environments and **enforce MongoDB usage** (no file system fallback).

## How It Works

### Development Mode (`NODE_ENV !== 'production'`)
- ✅ MongoDB Atlas is used when available
- ✅ File system fallback is allowed if MongoDB is unavailable
- ✅ Flexible for local development

### Production Mode (`NODE_ENV === 'production'`)
- ✅ **MongoDB Atlas is REQUIRED**
- ❌ File system fallback is **NOT allowed**
- ❌ Server will fail to start if MongoDB is not available
- ✅ Ensures data consistency and reliability

## Configuration

Set `NODE_ENV=production` in your production environment:

```bash
# In Render, Vercel, or other hosting platforms
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
```

## Behavior

### On Server Start
1. Server attempts to connect to MongoDB
2. **In production**: If connection fails, server startup fails (fail-fast)
3. **In development**: If connection fails, server continues with file system fallback

### During Runtime
1. All storage operations check MongoDB connection first
2. **In production**: If MongoDB unavailable, operations throw errors (no fallback)
3. **In development**: If MongoDB unavailable, operations use file system

## Error Handling

In production, if MongoDB becomes unavailable:
- Storage operations will throw errors
- Server logs will show critical errors
- Application will not silently fall back to file system
- This ensures you're aware of database issues immediately

## Benefits

1. **Data Consistency**: All data in one place (MongoDB)
2. **No Silent Failures**: Production issues are immediately visible
3. **Performance**: MongoDB is optimized for production workloads
4. **Scalability**: MongoDB scales better than file system
5. **Reliability**: No risk of data loss from file system issues

## Monitoring

Check your logs for:
- `✅ MongoDB Atlas connected successfully` - Good!
- `❌ MongoDB connection required in production` - Critical error, fix immediately
- `⚠️  MongoDB disconnected` - Connection lost, investigate

## Troubleshooting

### Server won't start in production
- Check `MONGODB_URI` is set correctly
- Verify MongoDB Atlas cluster is running
- Check network connectivity
- Verify IP whitelist in MongoDB Atlas

### Operations failing in production
- Check MongoDB connection status
- Review MongoDB Atlas dashboard
- Check connection string format
- Verify database user permissions


