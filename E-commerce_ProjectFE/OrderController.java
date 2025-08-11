package com.example.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.customannotations.ForOrders;
import com.example.dto.GetOrders;
import com.example.dto.PlaceOrder;
import com.example.dto.ReturnProductRequest;
import com.example.enums.OrderStatus;
import com.example.enums.PaymentStatus;
import com.example.enums.Role;
import com.example.model.OrderProduct;
import com.example.service.OrderService;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {
	
	private OrderService orderService;
		
	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping("/get-orderstatus") 
	public ResponseEntity<OrderStatus[]> getOrderStatus() {
		return ResponseEntity.ok(OrderStatus.values());
	}
	
	@PostMapping("/place-order")
	public ResponseEntity<ApiResponse<List<GetOrders>>> placeOrder(@RequestBody List<PlaceOrder> orderDetails) {
		return orderService.placeOrder(orderDetails);	
	}
	
	@GetMapping("/get-by-user/{userId}")
	public ResponseEntity<List<GetOrders>> getOrderByUserId(@PathVariable Long userId) {
		return orderService.getOrderByUser(userId);
	}
	 
	@GetMapping("/get-by-orderid/{orderId}")
	public ResponseEntity<List<GetOrders>> getByOrderId(@PathVariable Long orderId) {
		return orderService.getByOrderId(orderId);
	}
	
	@GetMapping("/get-by-orderstatus/{status}")
	@ForOrders(requiredRole = Role.ADMIN)
	public ResponseEntity<ApiResponse<List<OrderProduct>>> getOrders(@PathVariable OrderStatus status) {
		return orderService.getOrderStatus(status);
	}
	
	@GetMapping("/get-by-paymentstatus/{paymentStatus}")	
	@ForOrders(requiredRole = Role.ADMIN)
	public ResponseEntity<ApiResponse<List<OrderProduct>>> getOrder(@PathVariable PaymentStatus paymentStatus) {
		return orderService.getOrderByPayment(paymentStatus);
	}
	
	@GetMapping("/get-all")
	@ForOrders(requiredRole = Role.ADMIN)
	public ResponseEntity<ApiResponse<List<GetOrders>>> getAll() {
		return orderService.getAllOrders();
	}
	
	@PutMapping("update-orderstatus/{orderId}/{status}")
	@ForOrders(requiredRole = Role.ADMIN)
	public ResponseEntity<ApiResponse<OrderProduct>> updateOrderStatus(@PathVariable Long orderId, @PathVariable OrderStatus status) {
		return orderService.updateOrderStatus(orderId, status);
	}
	
	@PutMapping("update-paymentstatus/{orderId}/{status}")
	@ForOrders(requiredRole = Role.ADMIN)
	public ResponseEntity<ApiResponse<OrderProduct>> updatePaymentStatus(@PathVariable Long orderId, @PathVariable PaymentStatus status) {
		return orderService.updatePaymentStatus(orderId, status);
	}
	
	@GetMapping("get-payments")
	public ResponseEntity<PaymentStatus[]> getPayments() {
		return ResponseEntity.ok(PaymentStatus.values());
	}
	
	@PostMapping("/cancel-order/{orderId}")
	public ResponseEntity<ApiResponse<OrderProduct>> cancelOrder(@PathVariable Long orderId) {
		return orderService.cancelOrder(orderId);
	}
	
	@PostMapping("/return-product/{orderId}")
	public ResponseEntity<ApiResponse<OrderProduct>> returnProduct(@PathVariable Long orderId, @RequestBody ReturnProductRequest returnRequest) {
		return orderService.returnProduct(orderId, returnRequest);
	}
} 