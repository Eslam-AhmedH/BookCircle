using BookCircle.Core.DTOs.Notifications;
using BookCircle.Core.Enums;

namespace BookCircle.Core.Interfaces.Services;

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetByUserIdAsync(string userId);
    Task<NotificationDto> MarkAsReadAsync(int id, string userId);
    Task MarkAllAsReadAsync(string userId);
    Task CreateAsync(string userId, NotificationType type, string message, int? relatedEntityId = null);
}
