package esfita.entity;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "issue_menu_d", schema = "dbo") // adjust schema if needed
public class IssueMenuDHib implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 4045671315729640808L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", updatable = false)
	private int id;

	@Column(name = "issue_menu_m_fk")
	private int issueMenuMFk;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getIssueMenuMFk() {
		return issueMenuMFk;
	}

	public void setIssueMenuMFk(int issueMenuMFk) {
		this.issueMenuMFk = issueMenuMFk;
	}

	public int getIssueMenuHFk() {
		return issueMenuHFk;
	}

	public void setIssueMenuHFk(int issueMenuHFk) {
		this.issueMenuHFk = issueMenuHFk;
	}

	public int getMenuFk() {
		return menuFk;
	}

	public void setMenuFk(int menuFk) {
		this.menuFk = menuFk;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}

	public String getUniqueNo() {
		return uniqueNo;
	}

	public void setUniqueNo(String uniqueNo) {
		this.uniqueNo = uniqueNo;
	}

	public String getRecipeName() {
		return recipeName;
	}

	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}

	public String getRefNo() {
		return refNo;
	}

	public void setRefNo(String refNo) {
		this.refNo = refNo;
	}

	public String getCookingInstruction() {
		return cookingInstruction;
	}

	public void setCookingInstruction(String cookingInstruction) {
		this.cookingInstruction = cookingInstruction;
	}

	public long getCountryOriginFk() {
		return countryOriginFk;
	}

	public void setCountryOriginFk(long countryOriginFk) {
		this.countryOriginFk = countryOriginFk;
	}

	public long getBaseQuantityFk() {
		return baseQuantityFk;
	}

	public void setBaseQuantityFk(long baseQuantityFk) {
		this.baseQuantityFk = baseQuantityFk;
	}

	public double getBaseQuantity() {
		return baseQuantity;
	}

	public void setBaseQuantity(double baseQuantity) {
		this.baseQuantity = baseQuantity;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public double getFinishedProduct() {
		return finishedProduct;
	}

	public void setFinishedProduct(double finishedProduct) {
		this.finishedProduct = finishedProduct;
	}

	public double getPortionSize() {
		return portionSize;
	}

	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public double getPobParticipation() {
		return pobParticipation;
	}

	public void setPobParticipation(double pobParticipation) {
		this.pobParticipation = pobParticipation;
	}

	public double getTotalCost() {
		return totalCost;
	}

	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}

	public double getPerPortionCost() {
		return perPortionCost;
	}

	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
	}

	public char getStatus() {
		return status;
	}

	public void setStatus(char status) {
		this.status = status;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDateTime() {
		return createdDateTime;
	}

	public void setCreatedDateTime(Date createdDateTime) {
		this.createdDateTime = createdDateTime;
	}

	public int getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDateTime() {
		return lastActDateTime;
	}

	public void setLastActDateTime(Date lastActDateTime) {
		this.lastActDateTime = lastActDateTime;
	}

	public String getMenuDate() {
		return menuDate;
	}

	public void setMenuDate(String menuDate) {
		this.menuDate = menuDate;
	}

	public double getActualPobParticipation() {
		return actualPobParticipation;
	}

	public void setActualPobParticipation(double actualPobParticipation) {
		this.actualPobParticipation = actualPobParticipation;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	@Column(name = "issue_menu_h_fk")
	private int issueMenuHFk;

	@Column(name = "menu_fk")
	private int menuFk;

	@Column(name = "category_fk")
	private int categoryFk;

	@Column(name = "category_name")
	private String categoryName;

	@Column(name = "recipe_fk")
	private int recipeFk;

	@Column(name = "unique_no")
	private String uniqueNo;

	@Column(name = "recipe_name")
	private String recipeName;

	@Column(name = "ref_no")
	private String refNo;

	@Column(name = "cooking_instruction")
	private String cookingInstruction;

	@Column(name = "country_origin_fk")
	private long countryOriginFk;

	@Column(name = "base_quantity_fk")
	private long baseQuantityFk;

	@Column(name = "base_quantity")
	private double baseQuantity;

	@Column(name = "uom")
	private String uom;

	@Column(name = "finished_product")
	private double finishedProduct;

	@Column(name = "portion_size")
	private double portionSize;

	@Column(name = "image_url")
	private String imageUrl;

	@Column(name = "pob_particpation")
	private double pobParticipation;

	@Column(name = "total_cost")
	private double totalCost;

	@Column(name = "per_portion_cost")
	private double perPortionCost;

	@Column(name = "status")
	private char status;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "created_date_time")
	private Date createdDateTime;

	@Column(name = "last_act_by")
	private int lastActBy;

	@Column(name = "last_act_date_time")
	private Date lastActDateTime;
	
	@Column(name = "menu_date")
	private String menuDate;
	
	@Column(name = "actual_pob_participation")
	private double actualPobParticipation;
}


