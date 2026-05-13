namespace BookCircle.Core.Entities;

public class Comment
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int? ParentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Book Book { get; set; } = null!;
    public User User { get; set; } = null!;
    public Comment? Parent { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
}
