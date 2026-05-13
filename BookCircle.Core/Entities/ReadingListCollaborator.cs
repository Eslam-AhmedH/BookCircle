using Microsoft.EntityFrameworkCore;

namespace BookCircle.Core.Entities;

[PrimaryKey(nameof(ReadingListId), nameof(UserId))]
public class ReadingListCollaborator
{
    public int ReadingListId { get; set; }
    public string UserId { get; set; } = string.Empty;

    public ReadingList ReadingList { get; set; } = null!;
    public User User { get; set; } = null!;
}
