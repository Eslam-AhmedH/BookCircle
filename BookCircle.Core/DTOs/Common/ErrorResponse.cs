namespace BookCircle.Core.DTOs.Common;

public class ErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public string? Code { get; set; }
}
