using BookCircle.Core.Enums;

namespace BookCircle.Core.Entities;

public class BookReaction
{
    public int Id { get; set; }
    public int BookId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ReactionType Reaction { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Book Book { get; set; } = null!;
    public User User { get; set; } = null!;
}
