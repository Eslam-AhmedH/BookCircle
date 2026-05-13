using Microsoft.AspNetCore.Identity;
using BookCircle.Core.Enums;

namespace BookCircle.Core.Entities;

public class User : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Reader;
    public string? AvatarUrl { get; set; }
    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Book> Books { get; set; } = new List<Book>();
    public ICollection<BorrowRequest> BorrowRequests { get; set; } = new List<BorrowRequest>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<ReadingList> ReadingLists { get; set; } = new List<ReadingList>();
    public ICollection<BookReaction> Reactions { get; set; } = new List<BookReaction>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
