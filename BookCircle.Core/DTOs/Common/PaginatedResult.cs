namespace BookCircle.Core.DTOs.Common;

public class PaginatedResult<T>
{
    public IEnumerable<T> Items { get; set; } = new List<T>();
    public int Page { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
}
