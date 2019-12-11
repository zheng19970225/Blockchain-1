pragma solidity ^0.4.21;

contract SupplierFinancing {
    struct Company {
        // 公司有效性。
        bool isValid;
        // 是否为银行。
        bool isBank;
        address addr;
        // 统一社会信用号码。
        string id;
        // 名称。
        string name;

        // 应收账款单据ID。
        uint256 receiptId;
        uint amount;
        uint256 inAmount;
        uint256 outAmount;
        mapping (address => Receipt[]) inReceipts;
        mapping (address => Receipt[]) outReceipts;
    }

    // 应收账款单据。
    struct Receipt {
        // 单据ID。
        uint256 id;
        // 债务人。
        address debtor;
        // 债权人。
        address debtee;
        // 应收账款金额。
        uint256 amount;
        // 截止日期。
        uint deadline;
    }

    event RegistrationEvent(address addr, string id, string name);
    event TransactionEvent(address from, address to, uint256 amount);

    address adminAddr;
    mapping (address=>Company) public companies;

    constructor(address addr) {
        adminAddr = admin;

        TableFactory tf = TableFactory(0x1001);
        tf.createTable("t_company", "addr", "id,name,bank,amount,inAmount,outAmount");
    }

    function registerBank(address addr, string id, string name, uint256 amount) public {
        require(!companies[addr].isValid, "");
        require(msg.sender == adminAddr, "");

        Company storage bank = companies[addr];
        bank.isValid = true;
        bank.isBank = true;
        bank.addr = addr;
        bank.id = id;
        bank.name = name;
        bank.amount = amount;

        insertCompany(addr, id, name, true, amount);

        emit RegistrationEvent(addr, id, name);
    }

    function registerCompany(address addr, string id, string name) public {
        require(!companies[addr].isValid, "");
        require(msg.sender == adminAddr, "");

        Company storage company = companies[addr];
        company.isValid = true;
        company.isBank = false;
        company.addr = addr;
        company.id = id;
        company.name = name;

        insertCompany(addr, id, name, false, 0);

        emit RegistrationEvent(addr, id, name);
    }

    function transferCredit(address debtor, address debtee, uint256 amount, uint deadline) public {
        Company storage debtorCompany = companies[debtor];
        require(debtorCompany.isValid, "Debtor does not exist");
        Company storage debteeCompany = companies[debtee];
        require(debteeCompany.isValid, "Debtee does not exist");
        address verifier = msg.sender;
        Company memory verifierCompany = companies[verifier];
        // 确保只有银行才能调用该函数
        require(verifierCompany.isBank, "Only banks are allowed to signing transaction");
        require(debtorCompany.amount >= amount, "Debtor does not have enough balance");

        debtorCompany.amount -= amount;
        debtorCompany.inAmount += amount;
        updateCompany(debtor, debtorCompany.amount, debtorCompany.inAmount, debtorCompany.outAmount);

        debteeCompany.amount += amount;
        debteeCompany.outAmount += amount;
        updateCompany(debtee, debteeCompany.amount, debteeCompany.inAmount, debteeCompany.outAmount);

        debtorCompany.receiptId++;
        Receipt receipt;
        receipt.id = debtorCompany.receiptId;
        receipt.debtor = debtor;
        receipt.debtee = debtee;
        receipt.amount = amount;
        receipt.deadline = deadline;
        debtorComapny.inReceipts[debtee].push(receipt);
        debteeCompany.outReceipts[debtor].push(receipt);

        insertReceipt(debtor, debtee, debtorCompany.receiptId,);

        emit TransactionEvent(debtor, debtee, amount);
    }

    function openTable(string name) private returns(Table) {
        TableFactory tf = TableFactory(0x1001);
        return tf.openTable(name);
    }

    function insertCompany(address addr, string id, string name, bool isBank, uint256 amount) private {
        Table t_company = openTable("t_company");
        Entry entry = t_company.newEntry();
        entry.set("addr", addr);
        entry.set("id", id);
        entry.set("name", name);
        entry.set("bank", isBank);
        entry.set("amount", amount);
        entry.set("inAmount", 0);
        entry.set("outAmount", 0);
        int count = t_company.insert(bankAddr, entry);
        require(count == 1, "Fail to insert t_company record.");
    }

    function updateCompany(address addr, uint256 amount, uint256 inAmount, uint256 outAmount) private {
        Table t_company = openTable("t_company");
        Entry entry = t_company.newEntry();
        entry.set("amount", amount);
        entry.set("inAmount", inAmount);
        entry.set("outAmount", outAmount);
        Condition condition = t_company.newCondition();
        condition.EQ("addr", addr);
        int count = t_company.update(addr, entry, condition);
        require(count == 1, "Fail to update t_company record.");
    }

    function insertReceipt(address debtor, address debtee, uint256 id, uint256 amount, uint deadline) private {
        Table t_receipt = openTable("t_receipt");
        Entry entry = t_receipt.newEntry();
        entry.set("id", int(id));
        entry.set("debtor", debtor);
        entry.set("debtee", debtee);
        entry.set("amount", amount);
        entry.set("deadline", int(deadline));
        int count = t_receipt.insert(int(id), entry);
        require(count == 1, "Fail to insert t_receipt record.");
    }
}
