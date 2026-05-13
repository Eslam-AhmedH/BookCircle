namespace BookCircle.Core.Entities;

public class ReadingList
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<ReadingListItem> Items { get; set; } = new List<ReadingListItem>();
    public ICollection<ReadingListCollaborator> Collaborators { get; set; } = new List<ReadingListCollaborator>();
}
