namespace BookCircle.Core.Entities;

public class ReadingListItem
{
    public int Id { get; set; }
    public int ReadingListId { get; set; }
    public int BookId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public ReadingList ReadingList { get; set; } = null!;
    public Book Book { get; set; } = null!;
}
