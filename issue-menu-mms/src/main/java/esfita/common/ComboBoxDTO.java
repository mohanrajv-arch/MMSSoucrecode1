package esfita.common;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class ComboBoxDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = 4003377269733806369L;

	private int pk;
	private String id;
	private String locationId;
	private String locationName;
	private int supplierFk;
	private String code;
	private String name;
	private Date dat;
	private String pkOne;
	private String codeOne;
	private String nameOne;
	private String remarks;
	private int pkTwo;
	private String codeTwo;
	private String nameTwo;
	private int pkThree;
	private String codeThree;
	private String nameThree;
	private String namefour;

	private double cost;
	private double portionYield;
	private double portionSize;
	private String packageId;
	private String chefUnit;
	private double cookedWeight;
	private double iP02;

	private double idealPortion;
	private double percentage;

	private String imageURL;
	private String category;
	private String cuisine;
	private String meal;

	private String supplierId;
	private String supplierName;

	private int dishTypebfd;

	private LocalDate from;
	private LocalDate to;

	private boolean check;
	private int count;

	private List<Integer> locationFkList = new ArrayList<>();

	private double factor;
	private double factorCost;
	private String inventoryUnit;
	private double perUnit;
	private double chefCost;

	private String itemCode;
	private String itemName;
	private String accountName;
	private int accountFk;

	private String tranNo;

	private int itemId;

	private String reqNo;
	private String conId;
	private String QtnReqNo;

	private String consolidationId;

	private double currencyRate;
	private String currencyName;

	private int deliveryType;

	private double netInvoice;
	private double gross;
	private double discount;

	private int itemStateFk;
	private int itemQualityFk;
	private int itemOriginFk;
	private int itemCategoryFk;

	private String purchaseId;

	private String itemStateName;
	private String itemQualityName;
	private String itemOriginName;
	private String itemCategoryName;
	private String itemAccountName;

	private String uom;

	private String purchaseBaseUnit;
	private String purchaseSecondaryUnit;
	private double purchaseBaseFactor;
	private double purchaseSecondaryFactor;

	private String packageBaseUnit;
	private String packageSecondaryUnit;
	private double packageBaseFactor;
	private double packageSecondaryFactor;

	private double netReturnValue;

	private double quantity;
	private double packagePrice;
	private double packageSecondaryCost;
	private double perPortionCost;

	public int getPk() {
		return pk;
	}

	public void setPk(int pk) {
		this.pk = pk;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getLocationId() {
		return locationId;
	}

	public void setLocationId(String locationId) {
		this.locationId = locationId;
	}

	public String getLocationName() {
		return locationName;
	}

	public void setLocationName(String locationName) {
		this.locationName = locationName;
	}

	public int getSupplierFk() {
		return supplierFk;
	}

	public void setSupplierFk(int supplierFk) {
		this.supplierFk = supplierFk;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getDat() {
		return dat;
	}

	public void setDat(Date dat) {
		this.dat = dat;
	}

	public String getPkOne() {
		return pkOne;
	}

	public void setPkOne(String pkOne) {
		this.pkOne = pkOne;
	}

	public String getCodeOne() {
		return codeOne;
	}

	public void setCodeOne(String codeOne) {
		this.codeOne = codeOne;
	}

	public String getNameOne() {
		return nameOne;
	}

	public void setNameOne(String nameOne) {
		this.nameOne = nameOne;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public int getPkTwo() {
		return pkTwo;
	}

	public void setPkTwo(int pkTwo) {
		this.pkTwo = pkTwo;
	}

	public String getCodeTwo() {
		return codeTwo;
	}

	public void setCodeTwo(String codeTwo) {
		this.codeTwo = codeTwo;
	}

	public String getNameTwo() {
		return nameTwo;
	}

	public void setNameTwo(String nameTwo) {
		this.nameTwo = nameTwo;
	}

	public int getPkThree() {
		return pkThree;
	}

	public void setPkThree(int pkThree) {
		this.pkThree = pkThree;
	}

	public String getCodeThree() {
		return codeThree;
	}

	public void setCodeThree(String codeThree) {
		this.codeThree = codeThree;
	}

	public String getNameThree() {
		return nameThree;
	}

	public void setNameThree(String nameThree) {
		this.nameThree = nameThree;
	}

	public String getNamefour() {
		return namefour;
	}

	public void setNamefour(String namefour) {
		this.namefour = namefour;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}

	public double getPortionYield() {
		return portionYield;
	}

	public void setPortionYield(double portionYield) {
		this.portionYield = portionYield;
	}

	public double getPortionSize() {
		return portionSize;
	}

	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public String getChefUnit() {
		return chefUnit;
	}

	public void setChefUnit(String chefUnit) {
		this.chefUnit = chefUnit;
	}

	public double getCookedWeight() {
		return cookedWeight;
	}

	public void setCookedWeight(double cookedWeight) {
		this.cookedWeight = cookedWeight;
	}

	public double getiP02() {
		return iP02;
	}

	public void setiP02(double iP02) {
		this.iP02 = iP02;
	}

	public double getIdealPortion() {
		return idealPortion;
	}

	public void setIdealPortion(double idealPortion) {
		this.idealPortion = idealPortion;
	}

	public double getPercentage() {
		return percentage;
	}

	public void setPercentage(double percentage) {
		this.percentage = percentage;
	}

	public String getImageURL() {
		return imageURL;
	}

	public void setImageURL(String imageURL) {
		this.imageURL = imageURL;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getCuisine() {
		return cuisine;
	}

	public void setCuisine(String cuisine) {
		this.cuisine = cuisine;
	}

	public String getMeal() {
		return meal;
	}

	public void setMeal(String meal) {
		this.meal = meal;
	}

	public String getSupplierId() {
		return supplierId;
	}

	public void setSupplierId(String supplierId) {
		this.supplierId = supplierId;
	}

	public String getSupplierName() {
		return supplierName;
	}

	public void setSupplierName(String supplierName) {
		this.supplierName = supplierName;
	}

	public int getDishTypebfd() {
		return dishTypebfd;
	}

	public void setDishTypebfd(int dishTypebfd) {
		this.dishTypebfd = dishTypebfd;
	}

	public LocalDate getFrom() {
		return from;
	}

	public void setFrom(LocalDate from) {
		this.from = from;
	}

	public LocalDate getTo() {
		return to;
	}

	public void setTo(LocalDate to) {
		this.to = to;
	}

	public boolean isCheck() {
		return check;
	}

	public void setCheck(boolean check) {
		this.check = check;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public List<Integer> getLocationFkList() {
		return locationFkList;
	}

	public void setLocationFkList(List<Integer> locationFkList) {
		this.locationFkList = locationFkList;
	}

	public double getFactor() {
		return factor;
	}

	public void setFactor(double factor) {
		this.factor = factor;
	}

	public double getFactorCost() {
		return factorCost;
	}

	public void setFactorCost(double factorCost) {
		this.factorCost = factorCost;
	}

	public String getInventoryUnit() {
		return inventoryUnit;
	}

	public void setInventoryUnit(String inventoryUnit) {
		this.inventoryUnit = inventoryUnit;
	}

	public double getPerUnit() {
		return perUnit;
	}

	public void setPerUnit(double perUnit) {
		this.perUnit = perUnit;
	}

	public double getChefCost() {
		return chefCost;
	}

	public void setChefCost(double chefCost) {
		this.chefCost = chefCost;
	}

	public String getItemCode() {
		return itemCode;
	}

	public void setItemCode(String itemCode) {
		this.itemCode = itemCode;
	}

	public String getItemName() {
		return itemName;
	}

	public void setItemName(String itemName) {
		this.itemName = itemName;
	}

	public String getAccountName() {
		return accountName;
	}

	public void setAccountName(String accountName) {
		this.accountName = accountName;
	}

	public int getAccountFk() {
		return accountFk;
	}

	public void setAccountFk(int accountFk) {
		this.accountFk = accountFk;
	}

	public String getTranNo() {
		return tranNo;
	}

	public void setTranNo(String tranNo) {
		this.tranNo = tranNo;
	}

	public int getItemId() {
		return itemId;
	}

	public void setItemId(int itemId) {
		this.itemId = itemId;
	}

	public String getReqNo() {
		return reqNo;
	}

	public void setReqNo(String reqNo) {
		this.reqNo = reqNo;
	}

	public String getConId() {
		return conId;
	}

	public void setConId(String conId) {
		this.conId = conId;
	}

	public String getQtnReqNo() {
		return QtnReqNo;
	}

	public void setQtnReqNo(String qtnReqNo) {
		QtnReqNo = qtnReqNo;
	}

	public String getConsolidationId() {
		return consolidationId;
	}

	public void setConsolidationId(String consolidationId) {
		this.consolidationId = consolidationId;
	}

	public double getCurrencyRate() {
		return currencyRate;
	}

	public void setCurrencyRate(double currencyRate) {
		this.currencyRate = currencyRate;
	}

	public String getCurrencyName() {
		return currencyName;
	}

	public void setCurrencyName(String currencyName) {
		this.currencyName = currencyName;
	}

	public int getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(int deliveryType) {
		this.deliveryType = deliveryType;
	}

	public double getNetInvoice() {
		return netInvoice;
	}

	public void setNetInvoice(double netInvoice) {
		this.netInvoice = netInvoice;
	}

	public double getGross() {
		return gross;
	}

	public void setGross(double gross) {
		this.gross = gross;
	}

	public double getDiscount() {
		return discount;
	}

	public void setDiscount(double discount) {
		this.discount = discount;
	}

	public int getItemStateFk() {
		return itemStateFk;
	}

	public void setItemStateFk(int itemStateFk) {
		this.itemStateFk = itemStateFk;
	}

	public int getItemQualityFk() {
		return itemQualityFk;
	}

	public void setItemQualityFk(int itemQualityFk) {
		this.itemQualityFk = itemQualityFk;
	}

	public int getItemOriginFk() {
		return itemOriginFk;
	}

	public void setItemOriginFk(int itemOriginFk) {
		this.itemOriginFk = itemOriginFk;
	}

	public int getItemCategoryFk() {
		return itemCategoryFk;
	}

	public void setItemCategoryFk(int itemCategoryFk) {
		this.itemCategoryFk = itemCategoryFk;
	}

	public String getPurchaseId() {
		return purchaseId;
	}

	public void setPurchaseId(String purchaseId) {
		this.purchaseId = purchaseId;
	}

	public String getItemStateName() {
		return itemStateName;
	}

	public void setItemStateName(String itemStateName) {
		this.itemStateName = itemStateName;
	}

	public String getItemQualityName() {
		return itemQualityName;
	}

	public void setItemQualityName(String itemQualityName) {
		this.itemQualityName = itemQualityName;
	}

	public String getItemOriginName() {
		return itemOriginName;
	}

	public void setItemOriginName(String itemOriginName) {
		this.itemOriginName = itemOriginName;
	}

	public String getItemCategoryName() {
		return itemCategoryName;
	}

	public void setItemCategoryName(String itemCategoryName) {
		this.itemCategoryName = itemCategoryName;
	}

	public String getItemAccountName() {
		return itemAccountName;
	}

	public void setItemAccountName(String itemAccountName) {
		this.itemAccountName = itemAccountName;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public String getPurchaseBaseUnit() {
		return purchaseBaseUnit;
	}

	public void setPurchaseBaseUnit(String purchaseBaseUnit) {
		this.purchaseBaseUnit = purchaseBaseUnit;
	}

	public String getPurchaseSecondaryUnit() {
		return purchaseSecondaryUnit;
	}

	public void setPurchaseSecondaryUnit(String purchaseSecondaryUnit) {
		this.purchaseSecondaryUnit = purchaseSecondaryUnit;
	}

	public double getPurchaseBaseFactor() {
		return purchaseBaseFactor;
	}

	public void setPurchaseBaseFactor(double purchaseBaseFactor) {
		this.purchaseBaseFactor = purchaseBaseFactor;
	}

	public double getPurchaseSecondaryFactor() {
		return purchaseSecondaryFactor;
	}

	public void setPurchaseSecondaryFactor(double purchaseSecondaryFactor) {
		this.purchaseSecondaryFactor = purchaseSecondaryFactor;
	}

	public String getPackageBaseUnit() {
		return packageBaseUnit;
	}

	public void setPackageBaseUnit(String packageBaseUnit) {
		this.packageBaseUnit = packageBaseUnit;
	}

	public String getPackageSecondaryUnit() {
		return packageSecondaryUnit;
	}

	public void setPackageSecondaryUnit(String packageSecondaryUnit) {
		this.packageSecondaryUnit = packageSecondaryUnit;
	}

	public double getPackageBaseFactor() {
		return packageBaseFactor;
	}

	public void setPackageBaseFactor(double packageBaseFactor) {
		this.packageBaseFactor = packageBaseFactor;
	}

	public double getPackageSecondaryFactor() {
		return packageSecondaryFactor;
	}

	public void setPackageSecondaryFactor(double packageSecondaryFactor) {
		this.packageSecondaryFactor = packageSecondaryFactor;
	}

	public double getNetReturnValue() {
		return netReturnValue;
	}

	public void setNetReturnValue(double netReturnValue) {
		this.netReturnValue = netReturnValue;
	}

	public double getQuantity() {
		return quantity;
	}

	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}

	public double getPackagePrice() {
		return packagePrice;
	}

	public void setPackagePrice(double packagePrice) {
		this.packagePrice = packagePrice;
	}

	public double getPackageSecondaryCost() {
		return packageSecondaryCost;
	}

	public void setPackageSecondaryCost(double packageSecondaryCost) {
		this.packageSecondaryCost = packageSecondaryCost;
	}

	public double getPerPortionCost() {
		return perPortionCost;
	}

	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
	}
}
