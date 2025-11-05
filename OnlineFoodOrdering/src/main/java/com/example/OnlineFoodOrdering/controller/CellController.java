package com.example.OnlineFoodOrdering.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.OnlineFoodOrdering.entity.Cell;
import com.example.OnlineFoodOrdering.service.CellService;

@RestController
@RequestMapping("/api/cells")
@CrossOrigin(origins = "*")
public class CellController {

    @Autowired
    private CellService cellService;

    // ✅ Create a new cell using nested JSON
    @PostMapping
    public ResponseEntity<Cell> createCell(@RequestBody Cell cell) {
        if (cell.getSector() == null || cell.getSector().getId() == null) {
            throw new IllegalArgumentException("Sector ID must be provided");
        }
        return ResponseEntity.ok(cellService.createCell(cell, cell.getSector().getId()));
    }

    // ✅ Get all cells
    @GetMapping
    public ResponseEntity<List<Cell>> getAllCells() {
        return ResponseEntity.ok(cellService.getAllCells());
    }

    // ✅ Get cell by ID
    @GetMapping("/{id}")
    public ResponseEntity<Cell> getCellById(@PathVariable Long id) {
        return ResponseEntity.ok(cellService.getCellById(id));
    }

    // ✅ Get cells by sector ID
    @GetMapping("/by-sector/{sectorId}")
    public ResponseEntity<List<Cell>> getCellsBySector(@PathVariable Long sectorId) {
        return ResponseEntity.ok(cellService.getCellsBySectorId(sectorId));
    }

   @PutMapping("/{id}")
public ResponseEntity<Cell> updateCell(@PathVariable Long id, @RequestBody Cell updatedCell) {
    if (updatedCell.getSector() == null || updatedCell.getSector().getId() == null) {
        throw new IllegalArgumentException("Sector ID must be provided");
    }
    return ResponseEntity.ok(cellService.updateCell(id, updatedCell)); // only 2 arguments
}


    // ✅ Delete a cell
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCell(@PathVariable Long id) {
        cellService.deleteCell(id);
        return ResponseEntity.ok("Cell deleted successfully");
    }
}
