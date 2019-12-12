pragma solidity ^0.4.24;
import "./Table.sol";

contract SupplierFinancing {
    // 中央银行的公钥地址
    address adminAddr;
    // 全局票据 ID
    int nextReceiptId;

    // 注册事件
    event RegistrationEvent(int company_type, address addr, string uscc);
    // 信用凭证交易事件
    event TransactionEvent(address from, address to, int256 amount);
    // 信用凭证销毁事件
    event ReturnEvent(address from, address to, int256 amount);

    // 数据库表版本号
    string suffix;
    function concat(string _base, string _value) internal returns (string) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);
        string memory _tmpValue = new string(_baseBytes.length + _valueBytes.length);
        bytes memory _newValue = bytes(_tmpValue);
        uint i;
        uint j;
        for (i = 0; i <_baseBytes.length; i++) {
            _newValue[j++] = _baseBytes[i];
        }
        for (i = 0; i < _valueBytes.length; i++) {
            _newValue[j++] = _valueBytes[i];
        }
        return string(_newValue);
    }

    constructor(address _adminAddr, string uscc, string _suffix) {
        suffix = _suffix;

        adminAddr = _adminAddr;
        // 创建表。
        TableFactory tf = TableFactory(0x1001);
        tf.createTable(concat("t_company", suffix), "addr", "uscc,type,in_receipts,out_receipts");
        tf.createTable(concat("t_in_receipt", suffix), "debtee", "debtor,debtee,receiptId,amount,deadline");
        tf.createTable(concat("t_out_receipt", suffix), "debtor", "debtor,debtee,receiptId,amount,deadline");
        // 插入央行数据。
        insertCompany(adminAddr, uscc, 1, 10000000000000000000, 0);
    }

    // 打开指定名称的 AMDB 表。
    function openTable(string tableName) private returns(Table) {
        TableFactory tf = TableFactory(0x1001);
        return tf.openTable(concat(tableName, suffix));
    }

    // 根据 addr 获取公司信息。
    function selectCompany(address addr) private returns(string memory r1, int r2, int  r3, int  r4) {
        Table t_company = openTable("t_company");
        Entries entries = t_company.select(toString(addr), t_company.newCondition());
        require(entries.size() == 1, "company does not exist or is not unique");
        Entry entry = entries.get(0);
        r1 = entry.getString("uscc");
        r2 = entry.getInt("type");
        r3 = entry.getInt("in_receipts");
        r4 = entry.getInt("out_receipts");
    }

    // 根据 addr 获取公司的信用凭据信息。
    function selectCompanyReceipts(address addr) private returns(int, int) {
        string memory r1; int r2; int r3; int r4;
        (r1, r2, r3, r4) = selectCompany(addr);
        return (r3, r4);
    }

    // 插入公司信息。
    function insertCompany(address addr, string uscc, int t, int inReceipts, int outReceipts) private {
        Table t_company = openTable("t_company");
        Entries entries = t_company.select(toString(addr), t_company.newCondition());
        require(entries.size() == 0, "company should not exist");
        Entry entry = t_company.newEntry();
        entry.set("uscc", uscc);
        entry.set("type", t);
        entry.set("in_receipts", inReceipts);
        entry.set("out_receipts", outReceipts);
        // 插入数据，并判断是否需要回滚。
        t_company.insert(toString(addr), entry);
    }

    // 更新公司票据信息。
    function updateCompanyReceipts(address addr, int inReceipts, int outReceipts) private {
        Table t_company = openTable("t_company");
        Entries entries = t_company.select(toString(addr), t_company.newCondition());
        require(entries.size() == 1, "company does not exist or is not unique");
        Entry entry = entries.get(0);
        entry.set("in_receipts", inReceipts);
        entry.set("out_receipts", outReceipts);
        t_company.update(toString(addr), entry, t_company.newCondition());
    }

    // 注册普通银行。
    function registerBank(address addr, string uscc) public {
        // 鉴权：只有中央银行才可注册普通银行。
        require(msg.sender == adminAddr, "only the Admin Bank is allowed to register banks");
        insertCompany(addr, uscc, 2, 10000000000000, 0);
        emit RegistrationEvent(2, addr, uscc);
    }

    // 注册公司。
    function registerCompany(address addr, string uscc) public {
        string memory r1; int r2; int r3; int r4;
        (r1, r2, r3, r4) = selectCompany(msg.sender);
        // 鉴权：只有普通银行才可注册公司。
        require(r2 == 2, "only banks are allowed to register companies");
        insertCompany(addr, uscc, 3, 0, 0);
        emit RegistrationEvent(3, addr, uscc);
    }

    // 根据 key 和 receiptId 获取票据信息。
    function selectReceipt(string tableName, string key, int receiptId) private returns(address r1, address r2, int r3, int r4, int r5) {
        Table t_receipt = openTable(tableName);
        Condition condition = t_receipt.newCondition();
        condition.EQ("receiptId", receiptId);
        Entries entries = t_receipt.select(key, condition);
        require(entries.size() == 1, "receipt id does not exists or is not unique");
        Entry entry = entries.get(0);
        r1 = entry.getAddress("debtee");
        r2 = entry.getAddress("debtor");
        r3 = entry.getInt("receiptId");
        r4 = entry.getInt("amount");
        r5 = entry.getInt("deadline");
    }

    // 插入票据信息。
    function insertReceipt(string tableName, string key, address debtor, address debtee, int receiptId, int amount, int deadline) private {
        Table t_receipt = openTable(tableName);
        Entry entry = t_receipt.newEntry();
        entry.set("debtor", debtor);
        entry.set("debtee", debtee);
        entry.set("receiptId", receiptId);
        entry.set("amount", amount);
        entry.set("deadline", deadline);
        // 插入数据，并判断是否回滚。
        t_receipt.insert(key, entry);
    }

    // 更新指定 key 和 receiptId 对应的票据金额。
    function updateReceipts(string tableName, string key, int receiptId, int newAmount) private {
        Table t_receipt = openTable(tableName);
        Condition condition = t_receipt.newCondition();
        condition.EQ("receiptId", receiptId);
        if (newAmount <= 0) {
            t_receipt.remove(key, condition);
            return;
        }
        Entries entries = t_receipt.select(key, condition);
        require(entries.size() == 1, "receipt id not exists or unique");
        Entry entry = entries.get(0);
        entry.set("amount", newAmount);
        t_receipt.update(key, entry, condition);
    }

    // 转移信用凭证。
    // msg.sender = debtor
    // 使用场景：
    // 1. debtor 银行向 debtee 公司提供信用凭证。
    // 2. debtor 公司向 debtee 公司转移信用凭证。
    // 3. debtor 公司向 debtee 银行借款（转移信用至银行，表示融资）。
    function transferCredit(address debtee, int256 amount, int deadline) public {
        // 获取债务人的票据总量。
        int debtorIn; int debtorOut;
        (debtorIn, debtorOut) = selectCompanyReceipts(msg.sender);
        // 获取债权人的票据总量。
        int debteeIn; int debteeOut;
        (debteeIn, debteeOut) = selectCompanyReceipts(debtee);
        // 判断转移金额是否合法。
        require(debtorIn - debtorOut >= amount, "debtor does not have enough balance");
        // 更新双方的票据总量。
        debtorOut += amount;
        debteeIn += amount;
        updateCompanyReceipts(msg.sender, debtorIn, debtorOut);
        updateCompanyReceipts(debtee, debteeIn, debteeOut);
        // 插入新的票据信息。
        nextReceiptId++;
        insertReceipt("t_in_receipt", toString(debtee), msg.sender, debtee, nextReceiptId, amount, deadline);
        insertReceipt("t_out_receipt", toString(msg.sender), msg.sender, debtee, nextReceiptId, amount, deadline);

        emit TransactionEvent(msg.sender, debtee, amount);
    }

    // 返还信用凭证。
    // msg.sender = debtee
    // 使用场景：
    // 1. debtee 公司向 debtor 公司返还信用凭证（表示 debtor 公司向 debtee 公司支付货款）。
    // 2. debtee 公司向 debtor 银行返还信用凭证（表示期限前撤销信用凭证）。
    // 3. debtee 银行向 debtor 公司返还信用凭证（表示公司完成融资的还款）。
    function returnCredit(int receiptId, int amount) public {
        address r1; address r2; int r3; int r4; int r5;
        (r1, r2, r3, r4, r5) = selectReceipt("t_in_receipt", toString(msg.sender), receiptId);
        // 获取债务人的票据总量。
        int debtorIn; int debtorOut;
        (debtorIn, debtorOut) = selectCompanyReceipts(r2);
        // 获取债权人的票据总量。
        int debteeIn; int debteeOut;
        (debteeIn, debteeOut) = selectCompanyReceipts(r1);
        // 判断返还金额是否合法。
        require(r4 >= amount, "returning credit more than amount transfered at first is not allowed");
        // 更新双方的票据记录。
        updateReceipts("t_in_receipt", toString(r1), receiptId, r4 - amount);
        updateReceipts("t_out_receipt", toString(r2), receiptId, r4 - amount);
        // 更新双方的票据总量。
        debtorOut -= amount;
        debteeIn -= amount;
        updateCompanyReceipts(r2, debtorIn, debtorOut);
        updateCompanyReceipts(r1, debteeIn, debteeOut);

        emit ReturnEvent(r2, r1, amount);
    }

    // 转换地址为字符串。
    function toString(address x) private constant returns (string) {
        bytes32 value = bytes32(uint256(x));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}
