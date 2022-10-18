package org.visap.generator.layouts.kdtree;

import java.util.List;

/**
 * This class is specifically designed for a KD-Tree used in SVIS-Generato,
 * following the example of Richard Wettel's CodeCity-Visualization Tool
 * 
 * @see <a href="http://www.blackpawn.com/texts/lightmaps/"></a>
 */
public class CityKDTreeNode {
	public CityKDTreeNode() {
		super();
		this.leftChild = null;
		this.rightChild = null;
		this.rectangle = new CityRectangle();
		this.occupied = false;
	}

	public CityKDTreeNode(CityRectangle rectangle) {
		super();
		this.leftChild = null;
		this.rightChild = null;
		this.rectangle = rectangle;
		this.occupied = false;
	}

	public CityKDTreeNode(CityKDTreeNode leftChild, CityKDTreeNode rightChild, CityRectangle rectangle) {
		super();
		this.leftChild = leftChild;
		this.rightChild = rightChild;
		this.rectangle = rectangle;
		this.occupied = false;
	}
	
	private CityKDTreeNode leftChild;
	private CityKDTreeNode rightChild;
	private CityRectangle rectangle;
	private boolean occupied;
	
	public void isEmptyLeaf(CityRectangle r, List<CityKDTreeNode> list){
		if(this.rectangle.getWidth() >= r.getWidth() && this.rectangle.getLength() >= r.getLength() && this.occupied == false){
			list.add(this);
		}
		if(this.leftChild != null){
			this.leftChild.isEmptyLeaf(r, list);
		}
		if(this.rightChild != null){
			this.rightChild.isEmptyLeaf(r, list);
		}
	}
	public CityKDTreeNode getLeftChild() {
		return leftChild;
	}
	public void setLeftChild(CityKDTreeNode leftChild) {
		this.leftChild = leftChild;
	}
	public CityKDTreeNode getRightChild() {
		return rightChild;
	}
	public void setRightChild(CityKDTreeNode rightChild) {
		this.rightChild = rightChild;
	}
	public CityRectangle getCityRectangle() {
		return rectangle;
	}
	public void setCityRectangle(CityRectangle rectangle) {
		this.rectangle = rectangle;
	}
	public boolean isOccupied() {
		return occupied;
	}
	public void setOccupied() {
		this.occupied = true;
	}
}