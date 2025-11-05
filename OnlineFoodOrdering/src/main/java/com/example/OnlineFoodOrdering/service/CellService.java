package com.example.OnlineFoodOrdering.service;

import com.example.OnlineFoodOrdering.entity.Cell;
import com.example.OnlineFoodOrdering.entity.Sector;
import com.example.OnlineFoodOrdering.repository.CellRepository;
import com.example.OnlineFoodOrdering.repository.SectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CellService {

    @Autowired
    private CellRepository cellRepository;

    @Autowired
    private SectorRepository sectorRepository;

    // ✅ Create a new cell
    public Cell createCell(Cell cell, Long sectorId) {
        Sector sector = sectorRepository.findById(sectorId)
                .orElseThrow(() -> new RuntimeException("Sector not found with id: " + sectorId));
        cell.setSector(sector);
        return cellRepository.save(cell);
    }

    // ✅ Get all cells
    public List<Cell> getAllCells() {
        return cellRepository.findAll();
    }

    // ✅ Get cell by ID
    public Cell getCellById(Long id) {
        return cellRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cell not found with id: " + id));
    }

    // ✅ Get cells by sector ID
    public List<Cell> getCellsBySectorId(Long sectorId) {
        return cellRepository.findBySectorId(sectorId);
    }

    // ✅ Update a cell
    public Cell updateCell(Long id, Cell updatedCell) {
        Cell existingCell = cellRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cell not found with id: " + id));
        existingCell.setCode(updatedCell.getCode());
        existingCell.setName(updatedCell.getName());
        return cellRepository.save(existingCell);
    }

    // ✅ Delete a cell
    public void deleteCell(Long id) {
        if (!cellRepository.existsById(id)) {
            throw new RuntimeException("Cell not found with id: " + id);
        }
        cellRepository.deleteById(id);
    }
}
