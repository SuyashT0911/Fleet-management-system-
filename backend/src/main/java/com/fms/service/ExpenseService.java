package com.fms.service;

import com.fms.model.Expense;
import com.fms.model.Vehicle;
import com.fms.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public void createExpense(Vehicle vehicle, String type, BigDecimal amount, LocalDate date) {
        Expense expense = new Expense();
        expense.setVehicle(vehicle);
        expense.setType(type);
        expense.setAmount(amount);
        expense.setDate(date != null ? date : LocalDate.now());
        expenseRepository.save(expense);
    }
}
