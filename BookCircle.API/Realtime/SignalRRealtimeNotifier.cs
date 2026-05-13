using BookCircle.API.Hubs;
using BookCircle.Core.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;

namespace BookCircle.API.Realtime;

public class SignalRRealtimeNotifier : IRealtimeNotifier
{
    private readonly IHubContext<NotificationHub> _hub;

    public SignalRRealtimeNotifier(IHubContext<NotificationHub> hub)
    {
        _hub = hub;
    }

    public async Task SendBorrowRequestNewAsync(
        string ownerId, int requestId, int bookId, string bookTitle, string readerName)
    {
        await _hub.Clients.Group($"user-{ownerId}")
            .SendAsync("borrow_request_new", new
            {
                requestId,
                bookId,
                bookTitle,
                readerName
            });
    }

    public async Task SendBorrowRequestAcceptedAsync(
        string requesterId, int requestId, int bookId, string bookTitle)
    {
        await _hub.Clients.Group($"user-{requesterId}")
            .SendAsync("borrow_request_accepted", new
            {
                requestId,
                bookId,
                bookTitle
            });
    }

    public async Task SendBorrowRequestRejectedAsync(
        string requesterId, int requestId, int bookId, string bookTitle)
    {
        await _hub.Clients.Group($"user-{requesterId}")
            .SendAsync("borrow_request_rejected", new
            {
                requestId,
                bookId,
                bookTitle
            });
    }

    public async Task SendCommentNewAsync(
        string ownerId, int commentId, int bookId, string userName, string content, int? parentId)
    {
        await _hub.Clients.Group($"user-{ownerId}")
            .SendAsync("comment_new", new
            {
                commentId,
                bookId,
                userName,
                content,
                parentId
            });
    }

    public async Task SendCommentReplyAsync(
        string targetUserId, int commentId, int bookId, int parentId, string userName, string content)
    {
        await _hub.Clients.Group($"user-{targetUserId}")
            .SendAsync("comment_reply", new
            {
                commentId,
                bookId,
                parentId,
                userName,
                content
            });
    }

    public async Task SendNotificationNewAsync(
        string userId, int notificationId, string message, string type)
    {
        await _hub.Clients.Group($"user-{userId}")
            .SendAsync("notification_new", new
            {
                notificationId,
                message,
                type
            });
    }

    public async Task SendBookStatusChangedAsync(int bookId, string status)
    {
        // Broadcast to all connected users
        await _hub.Clients.All.SendAsync("book_status_changed", new
        {
            bookId,
            status
        });
    }
}