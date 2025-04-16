# import sys
# import os
# import pytest
# from unittest.mock import patch, MagicMock
# from datetime import datetime

# # ✅ Fix import path
# sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from routes.notifications import create_notification

# # 🔹 Test: successful notification creation
# @patch('routes.notifications.db')
# def test_create_notification_success(mock_db):
#     mock_collection = MagicMock()
#     mock_db.collection.return_value.document.return_value.collection.return_value = mock_collection

#     create_notification('user123', 'You have a new message', 'job456')

#     mock_collection.add.assert_called_once()
#     args, kwargs = mock_collection.add.call_args
#     assert args[0]['message'] == 'You have a new message'
#     assert args[0]['jobId'] == 'job456'
#     assert args[0]['status'] == 'unread'
#     assert isinstance(args[0]['timestamp'], datetime)

# # 🔹 Test: failure in Firestore write
# @patch('routes.notifications.db')
# def test_create_notification_firestore_error(mock_db, capsys):
#     mock_collection = MagicMock()
#     mock_collection.add.side_effect = Exception("Firestore down")
#     mock_db.collection.return_value.document.return_value.collection.return_value = mock_collection

#     create_notification('user123', 'Test message', 'job123')

#     captured = capsys.readouterr()
#     assert "Error creating notification: Firestore down" in captured.out
