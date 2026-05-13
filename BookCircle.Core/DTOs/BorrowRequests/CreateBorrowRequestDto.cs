using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.BorrowRequests;

public class CreateBorrowRequestDto
{
    [Required(ErrorMessage = "BookId is required")]
    [Range(1, int.MaxValue, ErrorMessage = "BookId must be a positive number")]
    public int BookId { get; set; }
}
