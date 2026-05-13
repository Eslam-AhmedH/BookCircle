using BookCircle.Core.Entities;

namespace BookCircle.Core.Interfaces.Repositories;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
    Task<Notification?> GetByIdAsync(int id);
    Task AddAsync(Notification notification);
    void Update(Notification notification);
    Task MarkAllReadAsync(string userId);
}
