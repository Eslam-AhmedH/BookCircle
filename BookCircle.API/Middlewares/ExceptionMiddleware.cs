using BookCircle.Core.DTOs.Common;
using System.Text.Json;

namespace BookCircle.API.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (statusCode, code) = ex switch
        {
            KeyNotFoundException => (404, "NOT_FOUND"),
            UnauthorizedAccessException => (401, "UNAUTHORIZED"),
            InvalidOperationException => (409, "CONFLICT"),
            ArgumentException => (400, "BAD_REQUEST"),
            _ => (500, "INTERNAL_SERVER_ERROR")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new ErrorResponse
        {
            Message = statusCode == 500
                ? "An unexpected error occurred. Please try again later."
                : ex.Message,
            Code = code
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}
