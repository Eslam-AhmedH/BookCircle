namespace BookCircle.Core.DTOs.Books;

public class BookQueryParams
{
    public string? Q { get; set; }
    public string? Genre { get; set; }
    public string? Status { get; set; }
    public string? Language { get; set; }
    public decimal? MaxPrice { get; set; }

    private int _page = 1;
    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    private int _limit = 12;
    public int Limit
    {
        get => _limit;
        set => _limit = value < 1 ? 12 : value > 100 ? 100 : value;
    }

    public string SortBy { get; set; } = "createdAt";
    public string SortDir { get; set; } = "desc";
}
