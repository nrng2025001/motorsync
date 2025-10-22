-- Database Schema Fix for Notification System
-- Run these commands in your backend database to fix notification issues

-- 1. Add notification fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_token_updated TIMESTAMP;

-- 2. Create notification_logs table
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

-- 3. Add foreign key constraint
ALTER TABLE notification_logs 
ADD CONSTRAINT fk_notification_user 
FOREIGN KEY (user_id) REFERENCES users(firebase_uid) 
ON DELETE CASCADE;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_delivered ON notification_logs(delivered);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);

-- 5. Create notification_preferences table (optional)
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
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(firebase_uid) ON DELETE CASCADE
);

-- 6. Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'notification_logs', 'notification_preferences')
ORDER BY table_name, ordinal_position;

-- 7. Test data insertion (optional - for testing)
-- INSERT INTO notification_logs (id, user_id, title, body, type, entity_id)
-- VALUES (
--     'test-notification-1',
--     'test-user-id',
--     'Test Notification',
--     'This is a test notification',
--     'test',
--     'test-entity-1'
-- );

-- 8. Clean up test data (run after testing)
-- DELETE FROM notification_logs WHERE id = 'test-notification-1';
