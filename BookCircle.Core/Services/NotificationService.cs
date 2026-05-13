using BookCircle.Core.DTOs.Notifications;
using BookCircle.Core.Entities;
using BookCircle.Core.Enums;
using BookCircle.Core.Interfaces;
using BookCircle.Core.Interfaces.Repositories;
using BookCircle.Core.Interfaces.Services;

namespace BookCircle.Core.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;
    private readonly IUnitOfWork _uow;
    private readonly IRealtimeNotifier? _realtimeNotifier;

    public NotificationService(
        INotificationRepository notificationRepo,
        IUnitOfWork uow,
        IRealtimeNotifier? realtimeNotifier = null)
    {
        _notificationRepo = notificationRepo;
        _uow = uow;
        _realtimeNotifier = realtimeNotifier;
    }

    public async Task<IEnumerable<NotificationDto>> GetByUserIdAsync(string userId)
    {
        var notifications = await _notificationRepo.GetByUserIdAsync(userId);
        return notifications.Select(MapToDto);
    }

    public async Task<NotificationDto> MarkAsReadAsync(int id, string userId)
    {
        var notification = await _notificationRepo.GetByIdAsync(id);
        if (notification == null)
            throw new KeyNotFoundException($"Notification with ID {id} not found");

        if (notification.UserId != userId)
            throw new UnauthorizedAccessException(
                "You are not authorized to update this notification");

        notification.IsRead = true;
        _notificationRepo.Update(notification);
        await _uow.SaveChangesAsync();
        return MapToDto(notification);
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        await _notificationRepo.MarkAllReadAsync(userId);
        await _uow.SaveChangesAsync();
    }

    public async Task CreateAsync(
        string userId,
        NotificationType type,
        string message,
        int? relatedEntityId = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Message = message,
            IsRead = false,
            RelatedEntityId = relatedEntityId,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepo.AddAsync(notification);
        await _uow.SaveChangesAsync();

        // 🔔 Send realtime notification via SignalR
        if (_realtimeNotifier != null)
        {
            await _realtimeNotifier.SendNotificationNewAsync(
                userId, notification.Id, message, type.ToString());
        }
    }

    private static NotificationDto MapToDto(Notification n) => new()
    {
        Id = n.Id,
        UserId = n.UserId,
        Type = n.Type.ToString(),
        Message = n.Message,
        IsRead = n.IsRead,
        RelatedEntityId = n.RelatedEntityId,
        CreatedAt = n.CreatedAt
    };
}