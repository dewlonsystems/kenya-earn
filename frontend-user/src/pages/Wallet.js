// src/pages/Wallet.js
import React, { useEffect, useState } from 'react';
import API_BASE_URL from './config';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  Divider,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  ArrowDownward as WithdrawIcon,
  Send as TransferIcon,
  CheckCircle as CheckIcon,
  HourglassEmpty as PendingIcon,
  Cancel as FailedIcon,
  ArrowUpward as EarnIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Wallet() {
  const { profile } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa');
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get('${API_BASE_URL}/api/wallet/');
        setWalletData(res.data);
      } catch (error) {
        console.error(error);
        setError('Failed to load wallet data.');
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleWithdrawOpen = () => setWithdrawOpen(true);
  const handleWithdrawClose = () => {
    setWithdrawOpen(false);
    setWithdrawAmount('');
    setError('');
  };

  const handleTransferOpen = () => setTransferOpen(true);
  const handleTransferClose = () => {
    setTransferOpen(false);
    setTransferAmount('');
    setTransferRecipient('');
    setError('');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (parseFloat(withdrawAmount) > walletData.balance) {
      setError('Insufficient balance.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post('${API_BASE_URL}/api/wallet/withdraw/', {
        amount: withdrawAmount,
        phone_number: profile?.phone_number,
      });
      // Success
      setWithdrawOpen(false);
      setWithdrawAmount('');
      // Refresh wallet
      const res = await axios.get('${API_BASE_URL}/api/wallet/');
      setWalletData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!transferRecipient) {
      setError('Please enter a referral code.');
      return;
    }
    if (parseFloat(transferAmount) > walletData.balance) {
      setError('Insufficient balance.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await axios.post('${API_BASE_URL}/api/wallet/transfer/', {
        recipient_code: transferRecipient,
        amount: transferAmount,
      });
      // Success
      setTransferOpen(false);
      setTransferAmount('');
      setTransferRecipient('');
      // Refresh wallet
      const res = await axios.get('${API_BASE_URL}/api/wallet/');
      setWalletData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
      case 'activation':
        return <EarnIcon sx={{ color: '#10b981' }} />;
      case 'withdrawal':
        return <WithdrawIcon sx={{ color: '#ef4444' }} />;
      case 'transfer':
        return <TransferIcon sx={{ color: '#3b82f6' }} />;
      default:
        return <WalletIcon />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip icon={<CheckIcon />} label="Completed" size="small" color="success" />;
      case 'pending':
        return <Chip icon={<PendingIcon />} label="Pending" size="small" color="warning" />;
      default:
        return <Chip icon={<FailedIcon />} label="Failed" size="small" color="error" />;
    }
  };

  if (loading) {
    return <Typography sx={{ mt: 4 }}>Loading wallet...</Typography>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>;
  }

  // Calculate sub-stats from real transactions
  const totalEarnings = walletData.transactions
    .filter(t => ['deposit', 'activation'].includes(t.type))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalWithdrawn = walletData.transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My Wallet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your earnings, withdrawals, and transfers.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
          <Button
            variant="contained"
            startIcon={<WithdrawIcon />}
            onClick={handleWithdrawOpen}
            sx={{ textTransform: 'none', borderRadius: 2, background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}
          >
            Withdraw Funds
          </Button>
          <Button
            variant="contained"
            startIcon={<TransferIcon />}
            onClick={handleTransferOpen}
            sx={{ textTransform: 'none', borderRadius: 2, background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' }}
          >
            Transfer
          </Button>
        </Box>
      </Box>

      {/* Balance Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          backgroundColor: '#f9fafb',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, flex: 1 }}>
            <Typography variant="h3" fontWeight="bold" color="#1e3a8a">
              KES {walletData.balance.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available Balance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: '#dcfce7',
                minWidth: 120,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Total Earnings
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="#166534">
                KES {totalEarnings.toFixed(2)}
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: '#fee2e2',
                minWidth: 120,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Withdrawn
              </Typography>
              <Typography variant="body1" fontWeight="bold" color="#b91c1c">
                KES {totalWithdrawn.toFixed(2)}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>

      {/* Transaction History */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold">
            Transaction History
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {walletData.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                walletData.transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                        cursor: 'pointer',
                      },
                    }}
                  >
                    <TableCell>
                      {new Date(tx.timestamp).toLocaleString('en-KE')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTypeIcon(tx.type)}
                        <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                          {tx.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {tx.recipient_name ? `To: ${tx.recipient_name}` : 'System'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        color={
                          tx.amount > 0 && tx.type !== 'withdrawal' ? 'success.main' : 'error.main'
                        }
                      >
                        {tx.amount > 0 && tx.type !== 'withdrawal' ? '+' : ''}
                        KES {Math.abs(tx.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(tx.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Footer */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        All transactions are securely processed and verified. For issues, contact support.
      </Typography>

      {/* Withdraw Modal */}
      <Dialog open={withdrawOpen} onClose={handleWithdrawClose}>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Withdrawal Method"
            value={withdrawMethod}
            onChange={(e) => setWithdrawMethod(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="mpesa">M-Pesa</MenuItem>
          </TextField>

          {withdrawMethod === 'mpesa' && (
            <TextField
              fullWidth
              label="M-Pesa Phone Number"
              value={profile?.phone_number || ''}
              disabled
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="Amount (KES)"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">KES</InputAdornment>,
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWithdrawClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleWithdraw}
            variant="contained"
            disabled={submitting || !withdrawAmount}
          >
            {submitting ? 'Processing...' : 'Withdraw Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={transferOpen} onClose={handleTransferClose}>
        <DialogTitle>Transfer to Another User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Recipient (Referral Code)"
            value={transferRecipient}
            onChange={(e) => setTransferRecipient(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Amount (KES)"
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">KES</InputAdornment>,
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTransferClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            variant="contained"
            disabled={submitting || !transferAmount || !transferRecipient}
          >
            {submitting ? 'Processing...' : 'Send Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}