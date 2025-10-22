-- Database Schema Fix for Notification System v2
-- Run these commands in your backend database to ensure notification system works properly

-- 1. Check if notification fields exist in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('fcm_token', 'device_type', 'last_token_updated');

-- 2. Add notification fields to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_token_updated TIMESTAMP;

-- 3. Create notification_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS notification_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255),
    sent_at TIMESTAMP DEFAULT NOW(),
    delivered BOOLEAN DEFAULT FALSE
);

-- 4. Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_notification_user' 
        AND table_name = 'notification_logs'
    ) THEN
        ALTER TABLE notification_logs 
        ADD CONSTRAINT fk_notification_user 
        FOREIGN KEY (user_id) REFERENCES users(firebase_uid) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_delivered ON notification_logs(delivered);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);

-- 6. Create notification_preferences table (optional)
CREATE TABLE IF NOT EXISTS notification_preferences (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    follow_up_enquiry BOOLEAN DEFAULT TRUE,
    follow_up_booking BOOLEAN DEFAULT TRUE,
    urgent_enquiry BOOLEAN DEFAULT TRUE,
    urgent_booking BOOLEAN DEFAULT TRUE,
    delivery_reminder BOOLEAN DEFAULT TRUE,
    evening_reminder BOOLEAN DEFAULT TRUE,
    weekly_summary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Add foreign key constraint for preferences
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_notification_preferences_user' 
        AND table_name = 'notification_preferences'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD CONSTRAINT fk_notification_preferences_user 
        FOREIGN KEY (user_id) REFERENCES users(firebase_uid) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 8. Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'notification_logs', 'notification_preferences')
ORDER BY table_name, ordinal_position;

-- 9. Test data insertion (optional - for testing)
-- INSERT INTO notification_logs (id, user_id, title, body, type, entity_id)
-- VALUES (
--     'test-notification-1',
--     'test-user-id',
--     'Test Notification',
--     'This is a test notification',
--     'test',
--     'test-entity-1'
-- );

-- 10. Clean up test data (run after testing)
-- DELETE FROM notification_logs WHERE id = 'test-notification-1';
