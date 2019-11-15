pragma solidity ^0.4.21;

contract SupplierFinancing {
  	// 事件：注册企业。
  	event Register(int256 ret, address addr);
  	// 事件：增加企业资产。
  	event AddAsset(int256 ret, address addr, uint256 amount);
  	// 事件：签发应收账款单据。
  	event Signature(int256 ret, address debtor, address debtee, uint256 amount);
  	// 事件：转移应收账款单据。
  	event Transfer(int256 ret, address a, address b, address c, uint256 amount);
  	// 事件：利用应收账款单据向银行融资。
  	event Finance(int256 ret, address a, address bank, uint256 amount);
  	// 事件：还款。
  	event Payback(int256 ret, address debtor, address debtee, uint256 amount);

	struct Company {
		bool isValid;
		// 公钥地址。
		address addr;
		// 信用等级。
		uint credit;
		// 现有资产。
		uint256 asset;
    	// 借入的资产。
    	uint256 inAsset;
    	// 借出的资产。
    	uint256 outAsset;
    	// 借出的资产明细。
		mapping (address => Receipt) receipts;
	}

	// 定义企业与企业间、企业与银行间的单据。
	struct Receipt {
    	// 单据有效性。
		bool isValid;
    	// 单据金额。
		uint256 amount;
	}

  	// 定义融资上限表。
	uint256[] public creditTable = [50, 500, 5000, 50000, 500000, 5000000, 50000000];
  	// 维护所有的企业信息。
	mapping (address => Company) public companies;
	// 银行是特殊的企业。
	address public bankAddr;

  	// 添加企业。
	function registerCompany(uint credit) public {
		// 有且仅有一个银行。
    	if (msg.sender == bankAddr) {
      		emit Register(-1, msg.sender);
      		return;
    	}
		// 一个公钥地址对应一个企业。
    	if (companies[msg.sender].isValid == true) {
      		emit Register(-2, msg.sender);
      		return;
    	}
		Company memory company = Company(true, msg.sender, credit, 0, 0, 0);
		companies[msg.sender] = company;
    	emit Register(0, msg.sender);
	}

  	// 获取企业信息。
	function getCompanyInfo(address addr) public constant returns(bool, uint256, uint256, uint256) {
    	Company memory company = companies[addr];
		return (company.isValid, company.asset, company.inAsset, company.outAsset);
	}

  	// 增加企业资产。
	function addAsset(uint256 amount) public {
		companies[msg.sender].asset += amount;
    	// 触发事件。
    	emit AddAsset(0, msg.sender, amount);
	}

  	// 获取应收账款单据。
  	function getReceipt(address debtor, address debtee) public constant returns(bool, uint256) {
    	Receipt memory receipt = companies[debtee].receipts[debtor];
    	return (receipt.isValid, receipt.amount);
  	}

	// 构造函数。
	constructor (address baddr) {
    	bankAddr = baddr;
    	Company storage bank = companies[bankAddr];
		bank.isValid = true;
    	bank.addr = bankAddr;
    	// 假定银行拥有最高的信用等级。
		bank.credit = 10000;
    	// 假定银行拥有“无限”的资产。
		bank.asset = 1000000000000000000;
    	bank.inAsset = 0;
    	bank.outAsset = 0;
	}

  	// 签发应收账款单据。
	function signature(address debtee, uint amount) public {
    	// 该函数由 debtor 触发。
    	// debtor：车企
    	// debee：轮胎厂

    	// 检查 debtee 是否存在。
    	if (companies[debtee].isValid == false) {
      		emit Signature(-1, debtor, debtee, amount);
      		return;
    	}
		address debtor = msg.sender;
    	Company storage companyDebtee = companies[debtee];
    	Company storage companyDebtor = companies[debtor];
		if (companyDebtee.receipts[debtor].isValid == false) {
			companyDebtee.receipts[debtor] = Receipt(true, amount);
		} else {
			companyDebtee.receipts[debtor].amount += amount;
		}
    	// 增加债权人的借出资产。
    	companyDebtee.outAsset += amount;
    	// 增加债务人的借入资产。
    	companyDebtor.inAsset += amount;
    	// 触发事件。
    	emit Signature(0, debtor, debtee, amount);
	}

  	// 转移应收账款单据。
	function transfer(address a, address c, uint256 amount) public returns(bool) {
    	// 该函数由 b 触发。
    	// a：车企
    	// b：轮胎厂
    	// c：轮毂厂

    	// 检查 a 和 c 是否存在。
    	if (companies[a].isValid == false || companies[c].isValid == false) {
      		emit Transfer(-1, a, b, c, amount);
      		return false;
    	}
		address b = msg.sender;
    	Company storage companyA = companies[a];
    	Company storage companyB = companies[b];
    	Company storage companyC = companies[c];
    	// 判断 a 是否欠 b 的钱、b 是否欠 c 的钱。
		if (companyB.receipts[a].isValid == false || companyC.receipts[b].isValid == false) {
      		emit Transfer(-2, a, b, c, amount);
			return false;
		}
    	uint256 ab = companyB.receipts[a].amount;
    	uint256 bc = companyC.receipts[b].amount;
    	uint256 ac = 0;
    	// 判断金额是否合法。
    	if (amount > ab) {
      		emit Transfer(-3, a, b, c, amount);
      		return false;
    	}
    	if (amount > bc) {
      		ac = bc;
      		companyC.receipts[b].isValid = false;
      		companyC.receipts[b].amount = 0;
    	} else {
      		ac = amount;
      		companyC.receipts[b].amount -= ac;
      		if (companyC.receipts[b].amount <= 0) {
        		companyC.receipts[b].isValid = false;
      		}
    	}
    	companyB.receipts[a].amount -= ac;
    	if (companyB.receipts[a].amount <= 0) {
      		companyB.receipts[a].isValid = false;
    	}
    	// 减少 b 的借入和借出资产。
    	companyB.outAsset -= ac;
    	companyB.inAsset -= ac;
    	if (companyC.receipts[a].isValid == false) {
      		companyC.receipts[a] = Receipt(true, ac);
    	} else {
      		companyC.receipts[a].amount += ac;
    	}
    	emit Transfer(0, a, b, c, ac);
    	return true;
	}

  	// 利用应收账款单据向银行融资。
	function finance(uint256 amount) public returns(bool) {
    	Company storage bank = companies[bankAddr];
		address debtor = msg.sender;
    	Company storage companyDebtor = companies[debtor];
		// 获取信用等级。
		uint credit = companies[debtor].credit;
    	// 若单次融资金额超出允许金额。
    	if (amount > creditTable[credit]) {
      		emit Finance(-1, debtor, bank.addr, amount);
      		return false;
    	}
    	// 若单次融资金额在允许范围内。
    	Receipt memory receipt = Receipt(true, amount);
    	// 若无融资记录。
    	if (bank.receipts[debtor].isValid == false) {
      		// 结合总资产判断总融资金额的合法性。
      		if (bank.receipts[debtor].amount + amount < creditTable[credit] + companyDebtor.asset + companyDebtor.outAsset - companyDebtor.inAsset) {
        		bank.receipts[debtor] = Receipt(true, amount);
        		bank.asset -= amount;

        		// 增加债务人的资产。
        		companyDebtor.asset += amount;
        		emit Finance(0, debtor, bank.addr, amount);
        		return true;
      		}
      		emit Finance(-2, debtor, bank.addr, amount);
      		return false;
    	}
    	// 若有融资记录。
    	// 结合总资产判断总融资金额的合法性。
    	if (bank.receipts[debtor].amount + amount < creditTable[credit] + companyDebtor.asset + companyDebtor.outAsset - companyDebtor.inAsset) {
      		bank.receipts[debtor].amount += amount;
      		// 增加债务人的资产。
      		companyDebtor.asset += amount;
      		emit Finance(0, debtor, bank.addr, amount);
      		return true;
    	}
    	emit Finance(-3, debtor, bank.addr, amount);
    	return false;
	}

  	// 还款。
	function payback(address debtor, uint256 amount) public returns(bool){
    	// 该函数由下游企业触发。
    	// debtor：上游企业。
    	// debtee：下游企业。

    	address debtee = msg.sender;
    	// 检查 debtor 是否存在。
    	if (companies[debtor].isValid == false) {
      		emit Payback(-1, debtor, debtee, 0);
      		return false;
    	}
		Company storage from = companies[debtor];
		Company storage to = companies[debtee];
    	// 若无相应欠款。
		if (to.receipts[debtor].isValid == false) {
      		emit Payback(-2, debtor, debtee, amount);
		    return false;
    	}
    	uint256 max_amount = to.receipts[debtor].amount;
    	// 还款金额合法性判断。
    	if (amount > max_amount) {
      		emit Payback(-3, debtor, debtee, amount);
      		return false;
    	}
    	// 若还款金额不足。
    	if (from.asset < amount) {
      		emit Payback(-4, debtor, debtee, amount);
      		return false;
    	}
    	// 减少单据金额。
    	to.receipts[debtor].amount -= amount;
    	if (to.receipts[debtor].amount <= amount) {
      		// 注销欠款记录。
      		to.receipts[debtor].isValid = false;
    	}
    	// 若还款金额足够。
    	to.asset += amount;
    	from.asset -= amount;
    	if (debtee != bankAddr) {
      		// 减少债务人的借入资产。
      		from.inAsset -= amount;
      		// 减少债券人的借出资产。
      		to.outAsset -= amount;
    	}
    	emit Payback(0, debtor, debtee, amount);
    	return true;
	}
}