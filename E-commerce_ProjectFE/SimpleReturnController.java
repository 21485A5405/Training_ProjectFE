// Simplified Backend Controller for Return Product

@PostMapping("/return-product/{orderId}")
public ResponseEntity<ApiResponse<OrderProduct>> returnProduct(@PathVariable Long orderId) {
    try {
        // Get current user
        User currUser = currentUser.getUser();
        if (currUser == null) {
            throw new UnAuthorizedException("Please Login");
        }

        // Find the order
        OrderProduct order = orderRepo.findById(orderId)
            .orElseThrow(() -> new CustomException("Order Not Found"));

        // Verify ownership
        if (!order.getUser().getUserId().equals(currUser.getUserId())) {
            throw new UnAuthorizedException("Not Authorized to Return This Order");
        }

        // Simple status update - let backend handle all validation
        order.setOrderStatus(OrderStatus.RETURNED);
        order.setPaymentStatus(PaymentStatus.REFUND_INITIATED);
        
        orderRepo.save(order);

        ApiResponse<OrderProduct> response = new ApiResponse<>();
        response.setMessage("Product return initiated successfully.");
        response.setData(order);

        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        ApiResponse<OrderProduct> response = new ApiResponse<>();
        response.setMessage("Failed to process return: " + e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
} 