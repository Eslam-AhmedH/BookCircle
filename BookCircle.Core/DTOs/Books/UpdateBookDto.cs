using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.Books;

public class UpdateBookDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(100)]
    public string? Author { get; set; }

    [MaxLength(50)]
    public string? Genre { get; set; }

    [MaxLength(20)]
    public string? Isbn { get; set; }

    [MaxLength(50)]
    public string? Language { get; set; }

    public DateTime? PublicationDate { get; set; }

    [Range(0, 10000)]
    public decimal? BorrowPrice { get; set; }

    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }

    [Url]
    public string? CoverImageUrl { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }
}
