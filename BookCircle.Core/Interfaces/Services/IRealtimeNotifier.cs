namespace BookCircle.Core.Interfaces.Services;

public interface IRealtimeNotifier
{
    Task SendBorrowRequestNewAsync(string ownerId, int requestId, int bookId, string bookTitle, string readerName);
    Task SendBorrowRequestAcceptedAsync(string requesterId, int requestId, int bookId, string bookTitle);
    Task SendBorrowRequestRejectedAsync(string requesterId, int requestId, int bookId, string bookTitle);
    Task SendCommentNewAsync(string ownerId, int commentId, int bookId, string userName, string content, int? parentId);
    Task SendCommentReplyAsync(string targetUserId, int commentId, int bookId, int parentId, string userName, string content);
    Task SendNotificationNewAsync(string userId, int notificationId, string message, string type);
    Task SendBookStatusChangedAsync(int bookId, string status);
}