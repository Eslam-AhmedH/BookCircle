using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.Books;

public class CreateBookDto
{
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Author is required")]
    [MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [Required(ErrorMessage = "Genre is required")]
    [MaxLength(50)]
    public string Genre { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Isbn { get; set; }

    [Required(ErrorMessage = "Language is required")]
    [MaxLength(50)]
    public string Language { get; set; } = string.Empty;

    public DateTime? PublicationDate { get; set; }

    [Required(ErrorMessage = "Borrow price is required")]
    [Range(0, 10000)]
    public decimal BorrowPrice { get; set; }

    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }

    [Url(ErrorMessage = "Must be a valid URL")]
    public string? CoverImageUrl { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }
}
