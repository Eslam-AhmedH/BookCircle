using System.ComponentModel.DataAnnotations;

namespace BookCircle.Core.DTOs.BorrowRequests;

public class RespondBorrowRequestDto
{
    [Required(ErrorMessage = "Status is required")]
    [RegularExpression("^(Accepted|Rejected)$", ErrorMessage = "Status must be Accepted or Rejected")]
    public string Status { get; set; } = string.Empty;
}
