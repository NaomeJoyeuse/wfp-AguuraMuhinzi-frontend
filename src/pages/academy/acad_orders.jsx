
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../Redux/Slices/order/orderSlice.js';
import { FiSearch, FiFilter, FiDownload, FiEye, FiX, FiPackage, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const AcademyOrders = () => {
  const dispatch = useDispatch();
  const { orders = [], loading, error } = useSelector((state) => state.order || {});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);

  const userId = parseInt(localStorage.getItem('user_id'), 10);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Use useMemo to filter orders efficiently
  const filteredOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    let academyOrders = orders.filter((order) => order.user.id === userId);
    
    // Apply status filter
    if (filterStatus !== 'all') {
      academyOrders = academyOrders.filter((order) => order.status === filterStatus);
    }
    
    // Apply date filter
    if (filterDate) {
      academyOrders = academyOrders.filter((order) => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate === filterDate;
      });
    }
    
    // Apply search term filter
    if (searchTerm) {
      academyOrders = academyOrders.filter(order => 
        (order.id?.toString().includes(searchTerm)) ||
        (order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return academyOrders;
  }, [orders, filterStatus, filterDate, searchTerm, userId]);

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedOrder(null);
    setDetailsModalVisible(false);
  };

  // Get counts for different order statuses
  const getStatusCounts = () => {
    if (!orders || !Array.isArray(orders)) return { total: 0, completed: 0, pending: 0, cancelled: 0 };
    
    const academyOrders = orders.filter((order) => order.user.id === userId);
    
    return {
      total: academyOrders.length,
      completed: academyOrders.filter(order => order.status === 'completed').length,
      pending: academyOrders.filter(order => order.status === 'pending').length,
      cancelled: academyOrders.filter(order => order.status === 'canceled').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Orders</h1>
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-150">
          <FiDownload size={18} />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg mr-4">
            <FiPackage size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{statusCounts.total}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 flex items-center">
          <div className="bg-green-100 p-3 rounded-lg mr-4">
            <FiCheckCircle size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed</p>
            <h3 className="text-2xl font-bold text-gray-800">{statusCounts.completed}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg mr-4">
            <FiClock size={24} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <h3 className="text-2xl font-bold text-gray-800">{statusCounts.pending}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 flex items-center">
          <div className="bg-red-100 p-3 rounded-lg mr-4">
            <FiXCircle size={24} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Cancelled</p>
            <h3 className="text-2xl font-bold text-gray-800">{statusCounts.cancelled}</h3>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by order ID or details..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="pl-10 pr-4 py-2 border rounded-lg appearance-none w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="canceled">Canceled</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FiFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="pl-3 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterDate('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiXCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Error loading orders: {error?.message || JSON.stringify(error)}</p>
                <button 
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                  onClick={() => dispatch(fetchOrders())}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Made To</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.cooperative?.username || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${order.total_price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-lg px-3 py-1 transition duration-150 mr-2"
                            onClick={() => handleViewOrder(order)}
                          >
                            <FiEye className="inline mr-1" /> View
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-1 transition duration-150">
                            Invoice
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          {searchTerm || filterStatus !== 'all' || filterDate ? 
                            "No orders match your search criteria" : 
                            "No orders found. Your orders will appear here once you start receiving them."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  Showing {filteredOrders.length} of {statusCounts.total} orders
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border rounded-md bg-white text-gray-700 disabled:opacity-50" disabled>Previous</button>
                  <button className="px-4 py-2 border rounded-md bg-white text-gray-700 disabled:opacity-50" disabled>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
    

      {/* Order Details Modal */}
     {/* Order Details Modal */}
{isDetailsModalVisible && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
        <div className="p-6 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            Order #{selectedOrder.id}
          </h3>
          <button 
            onClick={handleCloseDetailsModal}
            className="text-white hover:text-gray-200 transition duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Order Status Banner */}
      <div className={`w-full px-6 py-2 
        ${selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' : 
          selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
          selectedOrder.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
          'bg-red-100 text-red-800'}`}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium capitalize">Status: {selectedOrder.status}</span>
        </div>
      </div>
      
      {/* Order Content */}
      <div className="p-6">
        {/* Order and Cooperative Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Order Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Order Information</h4>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">Date:</span>
                <span>{formatDate(selectedOrder.created_at)}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">Total:</span>
                <span className="font-bold text-emerald-600">${selectedOrder.total_price}</span>
              </div>
            </div>
          </div>
          
          {/* Cooperative Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Cooperative Info</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-24">Name:</span>
                <span>{selectedOrder.cooperative?.username || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-24">Email:</span>
                <span>{selectedOrder.cooperative?.email || "N/A"}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-24">Phone:</span>
                <span>{selectedOrder.cooperative?.contact_phone || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="mb-6">
          <h4 className="font-semibold text-lg mb-3 text-gray-800">Order Items</h4>
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  selectedOrder.products.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {item.product}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                        ${item.price}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-sm text-center text-gray-500">
                      No items found in this order
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="2" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-emerald-600">
                    ${selectedOrder.total_price}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        {/* Academy Information (if applicable) */}
        {selectedOrder.user && selectedOrder.user.academy_details && (
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">Academy Information</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="flex">
                  <span className="font-medium text-gray-600 w-24">Name:</span>
                  <span>{selectedOrder.user.academy_details.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button 
            onClick={handleCloseDetailsModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-150"
          >
            Close
          </button>
          {selectedOrder.status !== 'completed' && (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150"
            >
              Update Status
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
   
    
    </div>
  );
};

export default AcademyOrders;