module.exports = (sequelize, DataTypes) => {
  const InvoiceLineItem = sequelize.define('InvoiceLineItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Invoices',
        key: 'id'
      }
    },
    serviceDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    supportItemNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    supportItemName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    gstCode: {
      type: DataTypes.STRING,
      defaultValue: 'GST'
    },
    gstAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    claimType: {
      type: DataTypes.ENUM('core', 'capacity_building', 'capital', 'stated_item'),
      allowNull: false,
      defaultValue: 'core'
    },
    fundingCategory: {
      type: DataTypes.STRING
    },
    appointmentId: {
      type: DataTypes.UUID,
      references: {
        model: 'Appointments',
        key: 'id'
      }
    },
    staffMemberId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return InvoiceLineItem;
};
