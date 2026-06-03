// 支付验证系统
// 通过 TronGrid API 检测链上交易

export class PaymentVerifier {
  constructor() {
    // 主网 API (正式网络)
    this.apiUrl = 'https://api.trongrid.io';
    // 测试网 API: 'https://nile.trongrid.io'
    
    this.walletAddress = 'TZ2Q6fXRP44bu28R4WTdMB3Tzf7TXfGR6m';
    this.usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // 主网 USDT 合约
    // Nile 测试网合约: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf'
  }
  
  // 检查是否有新的支付交易
  async checkPayment(userId, expectedAmount, timeWindow = 3600000) {
    console.log('🔍 Checking payment for user:', userId);
    console.log('Expected amount:', expectedAmount, 'USDT');
    
    try {
      // 获取最近的 TRC20 转账记录
      const transactions = await this.getRecentTransactions(timeWindow);
      
      // 查找匹配的交易
      const matchingTx = transactions.find(tx => {
        const amount = tx.value / 1000000; // USDT 6位小数
        const isCorrectAmount = Math.abs(amount - expectedAmount) < 0.01;
        
        console.log('Transaction:', tx.transaction_id);
        console.log('Amount:', amount, 'USDT');
        console.log('Match:', isCorrectAmount);
        
        return isCorrectAmount;
      });
      
      if (matchingTx) {
        return {
          success: true,
          transaction: matchingTx,
          txId: matchingTx.transaction_id,
          amount: matchingTx.value / 1000000,
          timestamp: matchingTx.block_timestamp
        };
      }
      
      return {
        success: false,
        message: '未找到匹配的交易'
      };
      
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 获取钱包的 TRC20 转账记录
  async getRecentTransactions(timeWindow = 3600000) {
    const minTimestamp = Date.now() - timeWindow;
    
    try {
      // 获取 TRC20 转账记录
      const url = `${this.apiUrl}/v1/accounts/${this.walletAddress}/transactions/trc20?limit=50&contract_address=${this.usdtContract}`;
      
      console.log('📡 Fetching transactions from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('📦 Received data:', data);
      
      if (!data.data || data.data.length === 0) {
        console.log('⚠️ No transactions found');
        return [];
      }
      
      // 过滤时间窗口内的交易
      const recentTxs = data.data.filter(tx => {
        return tx.block_timestamp >= minTimestamp;
      });
      
      console.log(`✅ Found ${recentTxs.length} recent transactions`);
      
      return recentTxs;
      
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      throw error;
    }
  }
  
  // 验证特定交易ID
  async verifyTransactionById(txId) {
    console.log('🔍 Verifying transaction:', txId);
    
    try {
      const url = `${this.apiUrl}/v1/transactions/${txId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Transaction not found');
      }
      
      const data = await response.json();
      
      // 检查交易是否成功
      const isSuccess = data.ret && data.ret[0].contractRet === 'SUCCESS';
      
      if (!isSuccess) {
        return {
          success: false,
          message: '交易失败'
        };
      }
      
      // 解析 TRC20 转账信息
      const contract = data.raw_data.contract[0];
      const parameter = contract.parameter.value;
      
      // 检查是否转到我们的地址
      const toAddress = this.hexToAddress(parameter.to);
      const amount = parseInt(parameter.amount, 16) / 1000000;
      
      if (toAddress !== this.walletAddress) {
        return {
          success: false,
          message: '收款地址不匹配'
        };
      }
      
      return {
        success: true,
        txId: txId,
        amount: amount,
        from: this.hexToAddress(parameter.owner_address),
        to: toAddress,
        timestamp: data.raw_data.timestamp
      };
      
    } catch (error) {
      console.error('❌ Transaction verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Hex 地址转 Base58 地址
  hexToAddress(hex) {
    // 简化版本，实际使用需要完整的转换库
    return hex; // TODO: 实现完整转换
  }
  
  // 获取钱包余额
  async getWalletBalance() {
    try {
      const url = `${this.apiUrl}/v1/accounts/${this.walletAddress}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      // TRX 余额
      const trxBalance = (data.balance || 0) / 1000000;
      
      console.log('💰 TRX Balance:', trxBalance);
      
      return {
        trx: trxBalance,
        // USDT 余额需要调用合约查询
      };
      
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      throw error;
    }
  }
}

// 全局实例
export const paymentVerifier = new PaymentVerifier();

// 在前端调用示例
window.verifyMyPayment = async function(userId, amount) {
  console.log('🔍 开始验证支付...');
  
  const result = await paymentVerifier.checkPayment(userId, amount);
  
  if (result.success) {
    console.log('✅ 支付验证成功！');
    console.log('交易ID:', result.txId);
    console.log('金额:', result.amount, 'USDT');
    
    alert(`支付验证成功！\n\n交易ID: ${result.txId}\n金额: ${result.amount} USDT\n\n会员即将激活...`);
    
    // 激活会员
    // activatePremium(days);
    
    return true;
  } else {
    console.log('❌ 未找到支付记录');
    alert('未找到支付记录\n\n请确保：\n1. 已完成转账\n2. 交易已确认（约3秒）\n3. 金额正确');
    
    return false;
  }
};

// 验证特定交易ID
window.verifyTransactionId = async function(txId) {
  console.log('🔍 验证交易ID:', txId);
  
  const result = await paymentVerifier.verifyTransactionById(txId);
  
  if (result.success) {
    alert(`✅ 交易验证成功！\n\n金额: ${result.amount} USDT\n时间: ${new Date(result.timestamp).toLocaleString()}`);
    return true;
  } else {
    alert(`❌ 交易验证失败\n\n原因: ${result.message || result.error}`);
    return false;
  }
};
